import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCryptoRates, useCreateWithdrawal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ShieldAlert, ArrowRight, ShieldCheck, AlertOctagon, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(50, "Minimum withdrawal is $50"),
  currency: z.string().min(1, "Please select a currency"),
  walletAddress: z.string().min(10, "Valid wallet address is required"),
});

export default function Withdrawals() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  const { data: rates } = useGetCryptoRates();
  const createWithdrawal = useCreateWithdrawal();

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      currency: "BTC",
      walletAddress: "",
    },
  });

  const amount = form.watch("amount");
  const currency = form.watch("currency");
  
  const selectedRate = rates?.find(r => r.symbol === currency);
  const cryptoEquivalent = (amount && selectedRate && amount > 0) ? (amount / selectedRate.usdRate) : 0;

  function onSubmit(values: z.infer<typeof withdrawSchema>) {
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
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: error.message || "Failed to process withdrawal.",
        });
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Withdraw Funds</h2>
        <p className="text-sm text-muted-foreground">Transfer assets to an external wallet.</p>
      </div>

      {step === 1 && (
        <Card className="bg-card/50 border-warning/20 backdrop-blur-sm overflow-hidden border-2">
          <div className="bg-warning/10 p-6 flex flex-col items-center text-center space-y-4 border-b border-warning/20">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-warning" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-warning mb-2">Identity Confirmation Required</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                To ensure the security of your funds, you must verify your identity before initiating a withdrawal. Do you wish to proceed with the verification process?
              </p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.history.back()}>
                DECLINE
              </Button>
              <Button className="w-full sm:w-auto bg-warning text-warning-foreground hover:bg-warning/90 font-bold tracking-wider" onClick={() => setStep(2)}>
                PROCEED <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex gap-4">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-primary">Identity Verification Active</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please contact <a href="https://t.me/AverAssistancebot" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">@AverAssistancebot</a> on Telegram to provide proof of your authenticity. Note: ONLY pictures are accepted for verification.
              </p>
            </div>
          </div>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Withdrawal Details</CardTitle>
              <CardDescription>Enter the amount and destination wallet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Amount (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input type="number" placeholder="0.00" className="pl-7 bg-background text-lg" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Select Asset</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rates?.map(rate => (
                              <SelectItem key={rate.symbol} value={rate.symbol}>
                                {rate.name} ({rate.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {cryptoEquivalent > 0 && (
                    <div className="p-3 bg-secondary/50 rounded-md border border-border/50 text-sm font-mono">
                      <span className="text-muted-foreground mr-2">Equivalent:</span>
                      <span className="font-bold text-primary">{cryptoEquivalent.toLocaleString(undefined, { maximumFractionDigits: 8 })} {currency}</span>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Destination Wallet Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter destination address" className="bg-background font-mono text-sm" {...field} />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground mt-1">Please ensure this is a valid HOT wallet address for {currency}.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full font-bold tracking-widest mt-4" disabled={createWithdrawal.isPending}>
                    {createWithdrawal.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    SUBMIT WITHDRAWAL
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && receiptData && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm overflow-hidden">
            <div className="bg-destructive/10 p-6 flex flex-col items-center text-center border-b border-destructive/20">
              <XCircle className="w-12 h-12 text-destructive mb-3" />
              <h3 className="text-xl font-bold text-destructive">Transaction Reversed</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">System halt after 5hr processing</p>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Ref ID</span>
                <span className="font-mono text-sm font-bold">WD-{receiptData.id}-SYS</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Amount</span>
                <span className="font-mono text-sm">${receiptData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Asset</span>
                <span className="font-mono text-sm">{receiptData.cryptoAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {receiptData.currency}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-border/50 gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Destination</span>
                <span className="font-mono text-xs break-all text-primary/80">{receiptData.walletAddress}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Date</span>
                <span className="font-mono text-xs">{receiptData.date}</span>
              </div>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="causes" className="border-border">
              <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors text-sm font-bold tracking-wide">
                <span className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-warning" />
                  See Possible Causes
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed bg-secondary/20 p-4 rounded-b-md">
                <p>The withdrawal was automatically reversed by our security systems. Common causes include:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Cold Wallet Detected</strong> — Transfers to cold wallets (hardware wallets like Ledger/Trezor) are blocked by our security system to prevent irreversible fund loss during active quantum trading periods. Please use a hot wallet (exchange wallet or software wallet like Trust).
                  </li>
                  <li>
                    <strong className="text-foreground">Identity Verification Incomplete</strong> — Your verification images sent to @AverAssistancebot have not been fully processed.
                  </li>
                  <li>
                    <strong className="text-foreground">Network Congestion</strong> — The destination blockchain experienced high volatility causing the transaction fee to exceed authorized limits.
                  </li>
                </ul>
                <div className="pt-2 border-t border-border/50 mt-4">
                  <p className="text-xs font-mono">For resolution, contact <a href="https://t.me/AverAssistancebot" target="_blank" rel="noreferrer" className="text-primary hover:underline">@AverAssistancebot</a> and reference ID: WD-{receiptData.id}-SYS.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
