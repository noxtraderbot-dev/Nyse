import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCryptoRates, useCreateWithdrawal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ShieldAlert, ArrowRight, AlertOctagon, XCircle, Lock, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const withdrawSchema = z.object({
  amount: z.coerce.number().min(50, "Minimum withdrawal is $50"),
  currency: z.string().min(1, "Please select a currency"),
  walletAddress: z.string().min(10, "Valid wallet address is required"),
});

type Step = 1 | 2 | 3;

export default function Withdrawals() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const { data: rates } = useGetCryptoRates();
  const createWithdrawal = useCreateWithdrawal();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const withdrawForm = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 0, currency: "BTC", walletAddress: "" },
  });

  const amount = withdrawForm.watch("amount");
  const currency = withdrawForm.watch("currency");
  const selectedRate = rates?.find(r => r.symbol === currency);
  const cryptoEquivalent = amount && selectedRate && amount > 0 ? amount / selectedRate.usdRate : 0;

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setVerifying(true);
    try {
      const token = localStorage.getItem("avernox_token");
      const res = await fetch("/api/settings/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: values.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast({ variant: "destructive", title: "Incorrect password", description: "The password you entered is incorrect." });
        return;
      }
      setStep(2);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not verify password. Please try again." });
    } finally {
      setVerifying(false);
    }
  }

  function onWithdrawSubmit(values: z.infer<typeof withdrawSchema>) {
    createWithdrawal.mutate({ data: values }, {
      onSuccess: (data) => {
        setReceiptData({
          ...values,
          id: data.id,
          date: new Date().toLocaleString(),
          cryptoAmount: cryptoEquivalent,
        });
        setStep(3);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Withdrawal Failed",
          description: error?.response?.data?.error || "Could not process withdrawal.",
        });
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 1 && step < 3 && (
          <button onClick={() => setStep(s => (s - 1) as Step)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Withdraw Funds</h2>
          <p className="text-sm text-muted-foreground">Transfer assets to your external wallet</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-16 transition-all ${step > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-2">{step === 1 ? "Verify Identity" : step === 2 ? "Withdrawal Details" : "Receipt"}</span>
      </div>

      {/* Step 1: Password verification */}
      {step === 1 && (
        <Card className="bg-card/50 border-2 border-warning/30 backdrop-blur-sm overflow-hidden">
          <div className="bg-warning/10 p-6 flex flex-col items-center text-center space-y-3 border-b border-warning/20">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-warning">Confirm Your Identity</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                For your security, please confirm your identity by entering your account password before withdrawing funds.
              </p>
            </div>
          </div>
          <CardContent className="p-6">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField control={passwordForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Account Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Enter your password" className="pl-10 bg-background" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => window.history.back()}>
                    Decline
                  </Button>
                  <Button type="submit" className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90 font-bold" disabled={verifying}>
                    {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify & Proceed <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Withdrawal details */}
      {step === 2 && (
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Withdrawal Details</CardTitle>
            <CardDescription>Enter the amount and destination wallet address.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...withdrawForm}>
              <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-5">
                <FormField control={withdrawForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Amount (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" placeholder="0.00" className="pl-7 bg-background text-lg font-semibold" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={withdrawForm.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Receive As</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rates?.map(rate => (
                          <SelectItem key={rate.symbol} value={rate.symbol}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{rate.name} ({rate.symbol})</span>
                              <span className="text-xs text-muted-foreground font-mono">${rate.usdRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {cryptoEquivalent > 0 && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">You will receive approximately:</span>
                    <span className="font-bold text-primary font-mono">{cryptoEquivalent.toLocaleString(undefined, { maximumFractionDigits: 8 })} {currency}</span>
                  </div>
                )}

                <FormField control={withdrawForm.control} name="walletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Destination Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter your ${currency} wallet address`} className="bg-background font-mono text-sm" {...field} />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground mt-1">Ensure this is a valid hot wallet address for {currency}. Cold wallets are not supported.</p>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full font-bold h-11" disabled={createWithdrawal.isPending}>
                  {createWithdrawal.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Withdrawal Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Receipt */}
      {step === 3 && receiptData && (
        <div className="space-y-5 animate-in fade-in zoom-in duration-500">
          <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm overflow-hidden">
            <div className="bg-destructive/10 p-6 flex flex-col items-center text-center border-b border-destructive/20 space-y-2">
              <div className="w-14 h-14 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-destructive">Transaction Reversed</h3>
              <p className="text-xs text-muted-foreground font-mono">System halt — 5hr processing window exceeded</p>
            </div>
            <CardContent className="p-5 space-y-3">
              {[
                { label: "Reference ID", value: `WD-${receiptData.id}-${Date.now().toString(36).toUpperCase()}` },
                { label: "Amount", value: `$${receiptData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: "Asset", value: `${receiptData.cryptoAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${receiptData.currency}` },
                { label: "Status", value: "REVERSED", isStatus: true },
                { label: "Initiated", value: receiptData.date },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{row.label}</span>
                  <span className={`font-mono text-sm ${row.isStatus ? "text-destructive font-bold" : ""}`}>{row.value}</span>
                </div>
              ))}
              <div className="pt-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Destination</span>
                <p className="font-mono text-xs break-all text-primary/80 mt-1">{receiptData.walletAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="causes" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 hover:no-underline text-sm font-bold hover:text-primary transition-colors">
                <span className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-warning" />
                  See Possible Causes
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground space-y-4 leading-relaxed">
                <p>Your withdrawal was automatically reversed by our security systems. Common causes include:</p>
                <ul className="space-y-3">
                  {[
                    { title: "Cold Wallet Detected", desc: "Transfers to cold wallets (hardware wallets such as Ledger or Trezor) are blocked by our security system during active AI trading periods. Please use a hot wallet (exchange wallet or mobile wallet like Trust Wallet or MetaMask)." },
                    { title: "Network Congestion", desc: "The destination blockchain experienced extreme volatility, causing the gas fee to exceed our authorized transaction limit. The system auto-reversed to protect your funds." },
                    { title: "Compliance Check", desc: "Automated compliance verification detected an irregularity with the destination address. This is a precautionary measure to protect your account from unauthorized transfers." },
                    { title: "Active Investment Period", desc: "Your funds are currently allocated to an active AI trading session. Full withdrawal access is restored once the current cycle completes." },
                  ].map(c => (
                    <li key={c.title} className="space-y-0.5">
                      <strong className="text-foreground">{c.title}</strong>
                      <p>{c.desc}</p>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-mono">For resolution, contact <a href="https://t.me/AverAssistancebot" target="_blank" rel="noreferrer" className="text-primary hover:underline">@AverAssistancebot</a> and reference ID: WD-{receiptData.id}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
