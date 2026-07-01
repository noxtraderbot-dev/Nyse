import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useForgotPassword, useVerifyOtp } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyOtp();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    forgotPasswordMutation.mutate({ data: values }, {
      onSuccess: () => {
        setEmail(values.email);
        setStep(2);
        toast({
          title: "OTP Sent",
          description: "Check your email for the authorization code.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: error.message || "Could not process request.",
        });
      }
    });
  }

  function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    // Validate double digit rule
    const hasDoubleDigit = /(.)\1/.test(values.otp);
    if (!hasDoubleDigit) {
      otpForm.setError("otp", { message: "Invalid code. Must contain a consecutive repeated digit." });
      return;
    }

    verifyOtpMutation.mutate({ data: { email, otp: values.otp } }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "Identity Verified",
          description: "Access restored successfully.",
        });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: error.message || "Invalid OTP.",
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-widest text-primary">ACCOUNT RECOVERY</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            {step === 1 ? "Identify Account" : "Verify Identity"}
          </p>
        </div>

        {step === 1 ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="quant@example.com" className="bg-background border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold tracking-widest" disabled={forgotPasswordMutation.isPending}>
                {forgotPasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                SEND RESET CODE
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Enter 6-Digit Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg font-mono border-border bg-background rounded-md" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="mt-4" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold tracking-widest" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                VERIFY
              </Button>
              <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep(1)}>
                Cancel
              </Button>
            </form>
          </Form>
        )}

        {step === 1 && (
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer">Return to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
