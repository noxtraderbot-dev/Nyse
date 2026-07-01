import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2, User, Mail, Lock, Gift, Shield, Cpu, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const logoUrl = `${import.meta.env.BASE_URL}aver-logo.jpeg`;

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(32, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const NETWORK_NODES = [
  { x: 15, y: 20 }, { x: 45, y: 10 }, { x: 80, y: 25 },
  { x: 25, y: 50 }, { x: 60, y: 45 }, { x: 90, y: 55 },
  { x: 10, y: 75 }, { x: 40, y: 70 }, { x: 75, y: 80 },
];
const CONNECTIONS = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
  [3, 6], [4, 7], [5, 8], [3, 4], [4, 5], [6, 7], [7, 8],
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", referralCode: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    registerMutation.mutate({ data: { ...values, confirmPassword: values.confirmPassword } }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "Account created!", description: "Welcome to AverNox TraderBot." });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error?.response?.data?.error || "Could not create account. Please try again.",
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-[#050d1a]">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020814] via-[#060e1f] to-[#040b18]" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        {/* Network SVG background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {CONNECTIONS.map(([a, b], i) => (
              <line
                key={i}
                x1={`${NETWORK_NODES[a].x}%`} y1={`${NETWORK_NODES[a].y}%`}
                x2={`${NETWORK_NODES[b].x}%`} y2={`${NETWORK_NODES[b].y}%`}
                stroke="#06b6d4" strokeWidth="0.3" opacity="0.5"
              />
            ))}
            {NETWORK_NODES.map((n, i) => (
              <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r="0.8" fill="#06b6d4" opacity="0.8" />
            ))}
          </svg>
        </div>

        {/* Orbs */}
        <div className="absolute top-1/3 -left-16 w-72 h-72 rounded-full bg-cyan-500/6 blur-[90px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 rounded-full bg-blue-500/5 blur-[70px] animate-float pointer-events-none" />

        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-10 h-10 border-l-2 border-t-2 border-cyan-500/20" />
        <div className="absolute top-8 right-8 w-10 h-10 border-r-2 border-t-2 border-cyan-500/20" />
        <div className="absolute bottom-8 left-8 w-10 h-10 border-l-2 border-b-2 border-cyan-500/20" />
        <div className="absolute bottom-8 right-8 w-10 h-10 border-r-2 border-b-2 border-cyan-500/20" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-500/25 shadow-lg shadow-cyan-500/10 animate-glow">
              <img src={logoUrl} alt="AverNox" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-wider">AverNox</span>
              <span className="text-[11px] text-cyan-400 block tracking-[0.25em] uppercase font-semibold">TraderBot</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Start your AI trading<br/>
              <span className="text-shimmer">journey today.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Join thousands of investors earning consistent returns with our autonomous AI engine.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Cpu, text: "AI-managed 7-day investment cycles", color: "text-cyan-400" },
              { icon: Globe, text: "Real-time global trade tracking", color: "text-blue-400" },
              { icon: Shield, text: "Secure deposits with instant credit", color: "text-green-400" },
              { icon: Gift, text: "Earn $15 for every friend you refer", color: "text-yellow-400" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5">
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {[
              { value: "$2.4B+", label: "Total Volume Traded" },
              { value: "91.4%", label: "AI Win Rate" },
            ].map(s => (
              <div key={s.label} className="crypto-pill rounded-lg p-3 text-center">
                <div className="text-lg font-black text-cyan-400 font-mono">{s.value}</div>
                <div className="text-slate-600 text-[10px] tracking-wider uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="text-slate-700 text-[10px] font-mono mt-6">© 2026 Aver. Built and maintained by NYSE.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto bg-[#060e1f]">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 py-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/25">
              <img src={logoUrl} alt="AverNox" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-black text-white tracking-wider">AverNox TraderBot</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">Fill in your details to get started for free</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-300">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input placeholder="johndoe" className="pl-10 bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500/50" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-300">Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input type="email" placeholder="you@example.com" className="pl-10 bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500/50" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-300">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input type="password" placeholder="Min. 8 characters + special char" className="pl-10 bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500/50" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-300">Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input type="password" placeholder="Re-enter your password" className="pl-10 bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500/50" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="referralCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-yellow-400" />
                    Referral code
                    <span className="text-slate-600 font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ENTER REFERRAL CODE"
                      className="bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 uppercase tracking-widest focus:border-cyan-500/50"
                      {...field}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-slate-600">Have a friend's referral code? Enter it to earn a bonus.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <Button
                type="submit"
                className="w-full font-bold h-11 mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold">Sign in</span>
            </Link>
          </div>

          <p className="text-[11px] text-slate-600 text-center border-t border-slate-800/60 pt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.<br />
            AverNox™ is a trademark of NYSE. © 2026 Aver.
          </p>
        </div>
      </div>
    </div>
  );
}
