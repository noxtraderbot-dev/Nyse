import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, TrendingUp, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

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
        toast({ title: "Welcome back!", description: "You have been signed in successfully." });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error?.response?.data?.error || error.message || "Invalid email or password.",
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwODkxYjIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaC02djZoNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-wider">AverNox</span>
              <span className="text-xs text-primary/80 block tracking-widest uppercase">TraderBot</span>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">AI-Powered Trading,<br/>Engineered for Returns.</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Access institutional-grade AI trading strategies. Your portfolio, managed with precision by our advanced algorithm.
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Avg. Return", value: "2.1x" },
              { label: "Win Rate", value: "91.4%" },
              { label: "Active Users", value: "47K+" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-primary font-bold text-lg">{stat.value}</div>
                <div className="text-slate-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs">© 2026 Aver. Built and maintained by NYSE.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary tracking-wider">AverNox TraderBot</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sign in to your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your email and password to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="you@example.com" className="pl-10 bg-background border-border" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <Link href="/forgot-password">
                      <span className="text-xs text-primary hover:underline cursor-pointer">Forgot password?</span>
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10 bg-background border-border" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full font-semibold h-11" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-primary hover:underline cursor-pointer font-medium">Create account</span>
            </Link>
          </div>

          <div className="border-t border-border/50 pt-6 text-center">
            <p className="text-[11px] text-muted-foreground/60">
              By signing in, you agree to AverNox's Terms of Service and Privacy Policy.<br/>
              AverNox™ is a trademark of NYSE. © 2026 Aver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
