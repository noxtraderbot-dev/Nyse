import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2, TrendingUp, User, Mail, Lock, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(32, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (!@#$%...)"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

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
          description: error?.response?.data?.error || error.message || "Could not create account. Please try again.",
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwODkxYjIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptNiAwaC02djZoNnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-wider">AverNox</span>
              <span className="text-xs text-primary/80 block tracking-widest uppercase">TraderBot</span>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight">Start your AI trading journey today.</h2>
            <ul className="space-y-3 text-slate-400 text-sm">
              {["AI-managed 7-day investment cycles", "Real-time trade tracking and analytics", "Secure deposits with instant credit", "24/7 portfolio monitoring"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="relative z-10 text-slate-600 text-xs">© 2026 Aver. Built and maintained by NYSE.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-7 animate-in fade-in slide-in-from-bottom-4 py-8">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary tracking-wider">AverNox TraderBot</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in your details to get started for free</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="johndoe" className="pl-10 bg-background border-border" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" className="pl-10 bg-background border-border" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Min. 8 characters + special char" className="pl-10 bg-background border-border" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Re-enter your password" className="pl-10 bg-background border-border" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="referralCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-primary" /> Referral code <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter referral code" className="bg-background border-border uppercase tracking-wider" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormDescription className="text-xs">Have a friend's referral code? Enter it here.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full font-semibold h-11 mt-2" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer font-medium">Sign in</span>
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center border-t border-border/50 pt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.<br/>
            AverNox™ is a trademark of NYSE. © 2026 Aver.
          </p>
        </div>
      </div>
    </div>
  );
}
