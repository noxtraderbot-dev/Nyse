import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Lock, Mail, Shield, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const logoUrl = `${import.meta.env.BASE_URL}aver-logo.jpeg`;

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const CHART_POINTS = "0,80 20,65 40,72 60,45 80,52 100,30 120,38 140,18 160,25 180,10 200,20 220,8 240,15 260,5";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "Welcome back!", description: "Signed in successfully." });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error?.response?.data?.error || "Invalid email or password.",
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-[#050d1a]">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020814] via-[#060e1f] to-[#040b18]" />
        <div className="absolute inset-0 bg-grid opacity-50" />

        {/* Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-cyan-500/8 blur-[100px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-blue-600/6 blur-[80px] animate-float-delayed pointer-events-none" />
        <div className="absolute top-2/3 left-1/3 w-40 h-40 rounded-full bg-cyan-400/5 blur-[60px] animate-float pointer-events-none" />

        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-10 h-10 border-l-2 border-t-2 border-cyan-500/25" />
        <div className="absolute top-8 right-8 w-10 h-10 border-r-2 border-t-2 border-cyan-500/25" />
        <div className="absolute bottom-8 left-8 w-10 h-10 border-l-2 border-b-2 border-cyan-500/25" />
        <div className="absolute bottom-8 right-8 w-10 h-10 border-r-2 border-b-2 border-cyan-500/25" />

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

          {/* Headline */}
          <div className="mb-8">
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              AI-Powered Trading,<br/>
              <span className="text-shimmer">Engineered for Returns.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Institutional-grade AI strategies managing your portfolio with precision around the clock.
            </p>
          </div>

          {/* Animated chart card */}
          <div className="mb-6 p-4 glass-card rounded-xl gradient-border relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Portfolio Performance</p>
                <p className="text-xl font-black text-white font-mono">+$14,832.50</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-bold text-green-400">+18.4%</span>
              </div>
            </div>
            <svg viewBox="0 0 260 90" className="w-full h-16" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points={CHART_POINTS}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sparkline-path"
              />
              <polygon
                points={`${CHART_POINTS} 260,90 0,90`}
                fill="url(#chartGrad)"
              />
            </svg>
            <div className="absolute top-3 right-3">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">7-Day AI Cycle</span>
            </div>
          </div>

          {/* Floating stat pills */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Avg. Return", value: "2.1x", color: "text-cyan-400" },
              { label: "Win Rate", value: "91.4%", color: "text-green-400" },
              { label: "Active Users", value: "47K+", color: "text-blue-400" },
            ].map(stat => (
              <div key={stat.label} className="crypto-pill rounded-lg p-3 text-center">
                <div className={`text-lg font-black font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-600 text-[10px] tracking-wider uppercase mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Security badges */}
          <div className="mt-auto flex items-center gap-3 flex-wrap">
            {[
              { icon: Shield, text: "256-bit SSL" },
              { icon: Zap, text: "AI Powered" },
              { icon: Lock, text: "Bank-Grade Security" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Icon className="w-3 h-3 text-cyan-500/60" />
                {text}
              </div>
            ))}
          </div>

          <p className="text-slate-700 text-[10px] font-mono mt-4">© 2026 Aver. Built and maintained by NYSE.</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#060e1f]">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/25">
              <img src={logoUrl} alt="AverNox" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-black text-white tracking-wider">AverNox TraderBot</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Sign in to your account</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your portfolio</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-300">Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="you@example.com"
                        className="pl-10 bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-slate-300">Password</FormLabel>
                    <Link href="/forgot-password">
                      <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">Forgot password?</span>
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-[#0a1628] border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button
                type="submit"
                className="w-full font-bold h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>

          {/* SSL indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10">
            <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-mono">Connection secured with 256-bit SSL encryption</span>
          </div>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold">Create account</span>
            </Link>
          </div>

          <div className="border-t border-slate-800/60 pt-5 text-center">
            <p className="text-[11px] text-slate-600">
              By signing in, you agree to AverNox's Terms of Service and Privacy Policy.<br />
              AverNox™ is a trademark of NYSE. © 2026 Aver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
