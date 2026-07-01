import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, useUpdateSettings, useChangePassword } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShieldCheck, User, Key, Bell, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  tradeAlertsEnabled: z.boolean(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
});

export default function Settings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  
  const updateSettings = useUpdateSettings();
  const changePassword = useChangePassword();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      tradeAlertsEnabled: true,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (settings) {
      profileForm.reset({
        username: settings.username,
        tradeAlertsEnabled: settings.tradeAlertsEnabled,
      });
    }
  }, [settings, profileForm]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    updateSettings.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Preferences Updated", description: "Your settings have been saved." });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not save settings." });
      }
    });
  }

  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    changePassword.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Security Updated", description: "Password changed successfully." });
        passwordForm.reset();
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Failed to change password", description: error.message || "Invalid current password." });
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">System Configuration</h2>
        <p className="text-sm text-muted-foreground">Manage your account settings and security preferences.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Settings */}
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Account Email</label>
                      <Input value={settings?.email || ""} disabled className="bg-secondary/50 font-mono text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed. Contact support for assistance.</p>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Account Status</label>
                      <div className="flex items-center gap-2 p-3 bg-secondary/30 border border-border rounded-md">
                        <ShieldCheck className="w-4 h-4 text-success" />
                        <span className="text-sm font-bold text-success uppercase tracking-wide">{settings?.accountStatus}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="tradeAlertsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-secondary/20">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" /> Quantitative Alerts
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Receive notifications for automated quantum trades and market impacts.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="font-bold tracking-widest text-xs" disabled={updateSettings.isPending}>
                    {updateSettings.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    SAVE CONFIGURATION
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Security Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" className="bg-background" {...field} />
                        </FormControl>
                        <FormDescription className="text-[10px]">Must be at least 8 characters and include a special character.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="outline" className="font-bold tracking-widest text-xs border-primary/20 text-primary" disabled={changePassword.isPending}>
                    {changePassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    UPDATE CREDENTIALS
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <HelpCircle className="w-10 h-10 text-primary mx-auto opacity-80" />
              <div>
                <h3 className="font-bold text-sm">Need Assistance?</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  For account issues, verification, or technical support, please contact our automated assistance system.
                </p>
              </div>
              <Button className="w-full font-bold tracking-widest text-xs bg-primary/20 text-primary hover:bg-primary/30" onClick={() => window.open('https://t.me/AverAssistancebot', '_blank')}>
                REPORT PROBLEM
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About System</h4>
                <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                  Developed by New York Stock Exchange (NYSE) • Version 1.0 • © 2026 Aver Express
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Legal & Compliance</h4>
                <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                  AverNox™ and AverNox TraderBot™ are trademarks of NYSE. Copyright © 2026 NYSE.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
