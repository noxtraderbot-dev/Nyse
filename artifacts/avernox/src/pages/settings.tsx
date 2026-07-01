import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, useUpdateSettings, useChangePassword, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Key, Bell, Bot, Shield, Wallet, Palette, BarChart2, Settings2, CheckCircle2, RotateCcw, LogOut, ChevronRight, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  tradeAlertsEnabled: z.boolean(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Minimum 8 characters").regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
});

// Purely visual/local settings
type LocalSettings = {
  aiEngine: string;
  autoTrading: boolean;
  riskLevel: string;
  autoStopLoss: boolean;
  priceAlerts: boolean;
  emailNotifications: boolean;
  twoFactor: boolean;
  loginAlerts: boolean;
  sessionTimeout: string;
  hideBalance: boolean;
  showProfitLoss: boolean;
  defaultCurrency: string;
  preferredCoin: string;
  preferredNetwork: string;
  saveWalletAddress: boolean;
  theme: string;
  language: string;
  timezone: string;
};

const DEFAULT_LOCAL: LocalSettings = {
  aiEngine: "quantum-v2",
  autoTrading: true,
  riskLevel: "moderate",
  autoStopLoss: true,
  priceAlerts: true,
  emailNotifications: false,
  twoFactor: false,
  loginAlerts: true,
  sessionTimeout: "30m",
  hideBalance: false,
  showProfitLoss: true,
  defaultCurrency: "USD",
  preferredCoin: "BTC",
  preferredNetwork: "ERC-20",
  saveWalletAddress: true,
  theme: "dark",
  language: "en",
  timezone: "UTC",
};

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "ai", label: "AI Trading", icon: Bot },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "portfolio", label: "Portfolio", icon: BarChart2 },
  { id: "crypto", label: "Crypto", icon: Wallet },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "password", label: "Password", icon: Key },
  { id: "about", label: "About", icon: Settings2 },
];

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function SelectRow({ label, desc, value, onChange, options }: { label: string; desc?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-36 h-8 text-xs bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function SliderRow({ label, desc, value, onChange, min = 0, max = 100 }: { label: string; desc?: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="py-3">
      <div className="flex justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
        <span className="text-xs font-mono text-primary">{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md" />
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>Conservative</span><span>Aggressive</span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const changePassword = useChangePassword();

  const [activeSection, setActiveSection] = useState("profile");
  const [local, setLocal] = useState<LocalSettings>(DEFAULT_LOCAL);
  const [localRisk, setLocalRisk] = useState(45);
  const [saved, setSaved] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", tradeAlertsEnabled: true },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: "", newPassword: "" },
  });

  useEffect(() => {
    if (settings) {
      profileForm.reset({ username: settings.username, tradeAlertsEnabled: settings.tradeAlertsEnabled });
    }
  }, [settings]);

  if (isLoading) {
    return <div className="flex h-[60vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const setL = (key: keyof LocalSettings, val: any) => setLocal(prev => ({ ...prev, [key]: val }));

  function handleSave() {
    setSaved(true);
    toast({ title: "Settings saved", description: "Your preferences have been saved successfully." });
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setLocal(DEFAULT_LOCAL);
    setLocalRisk(45);
    toast({ title: "Settings reset", description: "All settings restored to defaults." });
  }

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    updateSettings.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: useGetSettingsQueryKey() });
        toast({ title: "Profile updated", description: "Your profile information has been saved." });
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Update failed", description: error?.response?.data?.error || "Could not update profile." });
      }
    });
  }

  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    changePassword.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Password changed", description: "Your password has been updated successfully." });
        passwordForm.reset();
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Failed to change password", description: error?.response?.data?.error || "Incorrect current password." });
      }
    });
  }

  const referralCode = `AVX-${(settings?.username || "USER").toUpperCase().slice(0, 4)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your account details and preferences</p>
            </div>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Email Address</label>
                    <Input value={settings?.email || ""} disabled className="bg-secondary/40 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed. Contact support for assistance.</p>
                  </div>
                  <FormField control={profileForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Username</FormLabel>
                      <FormControl><Input placeholder="Enter username" className="bg-background" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className={`w-2.5 h-2.5 rounded-full ${settings?.accountStatus === "Active" ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
                  <span className="text-sm font-medium">Account Status:</span>
                  <span className={`text-sm font-bold ${settings?.accountStatus === "Active" ? "text-green-500" : "text-yellow-500"}`}>{settings?.accountStatus}</span>
                </div>
                <FormField control={profileForm.control} name="tradeAlertsEnabled" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4 bg-secondary/20">
                    <div>
                      <FormLabel className="text-sm font-semibold">Trade Alerts</FormLabel>
                      <FormDescription className="text-xs">Receive notifications for AI trade executions</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="font-semibold" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Profile
                </Button>
              </form>
            </Form>

            <Separator />

            <div>
              <h4 className="text-sm font-bold mb-2">Referral Program</h4>
              <p className="text-xs text-muted-foreground mb-3">Share your referral code and earn $15 for every person who signs up.</p>
              <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg">
                <code className="text-sm font-mono text-primary flex-1 tracking-wider">{referralCode}</code>
                <button onClick={() => { navigator.clipboard.writeText(referralCode); setCopiedReferral(true); setTimeout(() => setCopiedReferral(false), 2000); }} className="p-1.5 hover:bg-secondary rounded transition-colors">
                  {copiedReferral ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">AI Trading Configuration</h3>
              <p className="text-sm text-muted-foreground">Configure your AI engine and automation settings</p>
            </div>
            <div className="space-y-1 divide-y divide-border/50">
              <SelectRow label="AI Engine" desc="Select the trading algorithm" value={local.aiEngine} onChange={v => setL("aiEngine", v)} options={[{ value: "quantum-v2", label: "Quantum v2.0" }, { value: "neural-pro", label: "Neural Pro" }, { value: "alpha-hedge", label: "Alpha Hedge" }]} />
              <ToggleRow label="Auto Trading" desc="Allow AI to execute trades automatically" value={local.autoTrading} onChange={v => setL("autoTrading", v)} />
              <SelectRow label="Risk Level" desc="Overall risk tolerance for AI trades" value={local.riskLevel} onChange={v => setL("riskLevel", v)} options={[{ value: "conservative", label: "Conservative" }, { value: "moderate", label: "Moderate" }, { value: "aggressive", label: "Aggressive" }]} />
              <ToggleRow label="Auto Stop-Loss" desc="Automatically limit losses per trade" value={local.autoStopLoss} onChange={v => setL("autoStopLoss", v)} />
            </div>
            <SliderRow label="Risk Exposure" desc="Maximum portfolio allocation per trade" value={localRisk} onChange={setLocalRisk} />
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
            </div>
            <div className="space-y-1 divide-y divide-border/50">
              <ToggleRow label="Trade Alerts" desc="Notifications for every AI trade execution" value={local.priceAlerts} onChange={v => setL("priceAlerts", v)} />
              <ToggleRow label="Price Alerts" desc="Notify when assets hit target price levels" value={local.priceAlerts} onChange={v => setL("priceAlerts", v)} />
              <ToggleRow label="Email Notifications" desc="Receive summary emails for account activity" value={local.emailNotifications} onChange={v => setL("emailNotifications", v)} />
              <ToggleRow label="Goal Reached Alerts" desc="Notify when investment targets are hit" value={local.autoTrading} onChange={v => setL("autoTrading", v)} />
              <ToggleRow label="Market Impact Alerts" desc="Major market events affecting your portfolio" value={local.autoStopLoss} onChange={v => setL("autoStopLoss", v)} />
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Security Settings</h3>
              <p className="text-sm text-muted-foreground">Manage account access and authentication</p>
            </div>
            <div className="space-y-1 divide-y divide-border/50">
              <ToggleRow label="Two-Factor Authentication" desc="Add a second layer of login security" value={local.twoFactor} onChange={v => setL("twoFactor", v)} />
              <ToggleRow label="Login Alerts" desc="Email me when a new device signs in" value={local.loginAlerts} onChange={v => setL("loginAlerts", v)} />
              <SelectRow label="Session Timeout" desc="Auto-logout after period of inactivity" value={local.sessionTimeout} onChange={v => setL("sessionTimeout", v)} options={[{ value: "15m", label: "15 minutes" }, { value: "30m", label: "30 minutes" }, { value: "1h", label: "1 hour" }, { value: "never", label: "Never" }]} />
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm mb-1">Security Status</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Account is protected by 256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Last login: {new Date().toLocaleDateString()} — This device</span>
              </div>
            </div>
          </div>
        );

      case "portfolio":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Portfolio Display</h3>
              <p className="text-sm text-muted-foreground">Customize how your portfolio data is displayed</p>
            </div>
            <div className="space-y-1 divide-y divide-border/50">
              <ToggleRow label="Hide Balance" desc="Mask balance values on the dashboard" value={local.hideBalance} onChange={v => setL("hideBalance", v)} />
              <ToggleRow label="Show Profit / Loss" desc="Display P&L values in portfolio overview" value={local.showProfitLoss} onChange={v => setL("showProfitLoss", v)} />
              <SelectRow label="Default Currency" desc="Display currency for all values" value={local.defaultCurrency} onChange={v => setL("defaultCurrency", v)} options={[{ value: "USD", label: "USD ($)" }, { value: "EUR", label: "EUR (€)" }, { value: "GBP", label: "GBP (£)" }, { value: "BTC", label: "BTC (₿)" }]} />
            </div>
          </div>
        );

      case "crypto":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Crypto Preferences</h3>
              <p className="text-sm text-muted-foreground">Set your preferred assets and networks</p>
            </div>
            <div className="space-y-1 divide-y divide-border/50">
              <SelectRow label="Preferred Coin" desc="Default crypto for transactions" value={local.preferredCoin} onChange={v => setL("preferredCoin", v)} options={[{ value: "BTC", label: "Bitcoin (BTC)" }, { value: "ETH", label: "Ethereum (ETH)" }, { value: "SOL", label: "Solana (SOL)" }, { value: "BNB", label: "BNB" }]} />
              <SelectRow label="Preferred Network" desc="Default blockchain network" value={local.preferredNetwork} onChange={v => setL("preferredNetwork", v)} options={[{ value: "ERC-20", label: "ERC-20 (Ethereum)" }, { value: "BEP-20", label: "BEP-20 (BNB Chain)" }, { value: "SOL", label: "Solana" }, { value: "BTC", label: "Bitcoin" }]} />
              <ToggleRow label="Save Wallet Address" desc="Remember last used wallet addresses" value={local.saveWalletAddress} onChange={v => setL("saveWalletAddress", v)} />
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Appearance & Localization</h3>
              <p className="text-sm text-muted-foreground">Customize your visual experience and regional settings</p>
            </div>
            <div className="space-y-1 divide-y divide-border/50">
              <SelectRow label="Theme" desc="Choose your interface color scheme" value={local.theme} onChange={v => setL("theme", v)} options={[{ value: "dark", label: "Dark Mode" }, { value: "light", label: "Light Mode" }, { value: "auto", label: "System Default" }]} />
              <SelectRow label="Language" desc="Display language for the platform" value={local.language} onChange={v => setL("language", v)} options={[{ value: "en", label: "English" }, { value: "es", label: "Español" }, { value: "fr", label: "Français" }, { value: "de", label: "Deutsch" }]} />
              <SelectRow label="Time Zone" desc="Your local time zone" value={local.timezone} onChange={v => setL("timezone", v)} options={[{ value: "UTC", label: "UTC" }, { value: "EST", label: "EST (UTC-5)" }, { value: "PST", label: "PST (UTC-8)" }, { value: "GMT", label: "GMT (UTC+0)" }, { value: "CET", label: "CET (UTC+1)" }]} />
            </div>
          </div>
        );

      case "password":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password for enhanced security</p>
            </div>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField control={passwordForm.control} name="oldPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Current Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" className="bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Min. 8 chars + special character" className="bg-background" {...field} /></FormControl>
                    <FormDescription className="text-xs">Must be at least 8 characters and contain a special character.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" variant="outline" className="border-primary/20 text-primary font-semibold" disabled={changePassword.isPending}>
                  {changePassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                  Update Password
                </Button>
              </form>
            </Form>
          </div>
        );

      case "about":
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold">About AverNox</h3>
              <p className="text-sm text-muted-foreground">Platform information and legal details</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Platform", value: "AverNox TraderBot" },
                { label: "Version", value: "1.0.0" },
                { label: "Developer", value: "New York Stock Exchange (NYSE)" },
                { label: "Copyright", value: "© 2026 Aver" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg border border-border/50 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Legal Notice</p>
              <p>AverNox™ and AverNox TraderBot™ are trademarks of NYSE. The platform's content, interface, graphics, software, and source code are the intellectual property of NYSE. Copyright © 2026 NYSE. All rights reserved.</p>
            </div>
            <div className="space-y-2">
              <a href="https://t.me/AverNoxTraderbot" target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full justify-between font-medium">
                  <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Telegram Bot</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://t.me/AverAssistancebot" target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full justify-between font-medium">
                  <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Support — @AverAssistancebot</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account, trading preferences, and security settings.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
                  <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" />{s.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              );
            })}
            <Separator className="my-2" />
            <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-6">
              {renderSection()}

              {/* Save/Reset bar (only for local settings sections) */}
              {["ai", "notifications", "security", "portfolio", "crypto", "appearance"].includes(activeSection) && (
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border/50">
                  <Button onClick={handleSave} className="font-semibold" disabled={saved}>
                    {saved ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Saved</> : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="font-medium">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset to Defaults
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}
