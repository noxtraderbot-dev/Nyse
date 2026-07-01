import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateDeposit } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Copy, CheckCircle2, AlertCircle, Bitcoin, ArrowRight, Clock, MessageCircle, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WALLETS = {
  BTC: {
    address: "bc1qcvz09vzyysrfr0fpve5xwhlj4ypz39qdgtsycc",
    qr: "/qr-btc.jpeg",
    name: "Bitcoin",
    symbol: "BTC",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    network: "Bitcoin Network",
    minConfirm: "2",
  },
  ETH: {
    address: "0x59E7b2AAA647d3f797234288712736219CB5EDFb",
    qr: "/qr-eth.jpeg",
    name: "Ethereum",
    symbol: "ETH",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    network: "ERC-20 Network",
    minConfirm: "12",
  },
  SOL: {
    address: "CZnxV8FRRsAfJZALLAwy8h5EXfkUYjwJbfiEBbiLE5WA",
    qr: "/qr-sol.jpeg",
    name: "Solana",
    symbol: "SOL",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    network: "Solana Network",
    minConfirm: "32",
  },
};

const onchainSchema = z.object({
  currency: z.enum(["BTC", "ETH", "SOL"]),
  amount: z.coerce.number().min(10, "Minimum deposit is $10"),
  txnCode: z.string().min(5, "Transaction code is required"),
});

const manualSchema = z.object({
  amount: z.coerce.number().min(50, "Minimum deposit is $50"),
  txnCode: z.string().min(5, "Transaction code is required"),
});

const TIMER_SECONDS = 25 * 60; // 25 minutes

type DepositMode = "select" | "onchain" | "manual";
type ManualStep = "amount" | "pending" | "expired";

export default function Deposit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<DepositMode>("select");
  const [copied, setCopied] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<keyof typeof WALLETS>("BTC");

  // Manual deposit state
  const [manualStep, setManualStep] = useState<ManualStep>("amount");
  const [manualAmount, setManualAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createDeposit = useCreateDeposit();

  const onchainForm = useForm<z.infer<typeof onchainSchema>>({
    resolver: zodResolver(onchainSchema),
    defaultValues: { currency: "BTC", amount: 0, txnCode: "" },
  });

  const manualForm = useForm<z.infer<typeof manualSchema>>({
    resolver: zodResolver(manualSchema),
    defaultValues: { amount: 0, txnCode: "" },
  });

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            setManualStep("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
  };

  function onOnchainSubmit(values: z.infer<typeof onchainSchema>) {
    createDeposit.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Deposit Confirmed", description: "Your account has been funded successfully." });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Invalid Transaction Code",
          description: error?.response?.data?.error || "The transaction code provided is invalid or already used.",
        });
      }
    });
  }

  function onManualAmountSubmit(values: z.infer<typeof manualSchema>) {
    setManualAmount(values.amount);
    setManualStep("pending");
    setTimeLeft(TIMER_SECONDS);
    setTimerActive(true);
  }

  function onManualTxnSubmit() {
    const txnCode = manualForm.getValues("txnCode");
    if (!txnCode || txnCode.length < 5) {
      toast({ variant: "destructive", title: "Invalid Code", description: "Please enter a valid transaction code." });
      return;
    }
    createDeposit.mutate({ data: { currency: "MANUAL", amount: manualAmount, txnCode } }, {
      onSuccess: () => {
        clearInterval(timerRef.current!);
        setTimerActive(false);
        toast({ title: "Deposit Confirmed", description: "Your account has been funded successfully." });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Invalid Transaction Code",
          description: error?.response?.data?.error || "The transaction code is invalid or has already been used.",
        });
      }
    });
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const timerPercent = ((TIMER_SECONDS - timeLeft) / TIMER_SECONDS) * 100;

  // ─── Mode selection screen ──────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fund Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose your preferred deposit method to get started.</p>
        </div>
        <div className="grid gap-4">
          <button onClick={() => setMode("onchain")} className="group text-left p-6 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">On-Chain Deposit</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Send crypto directly to our wallet address. Supports Bitcoin, Ethereum, and Solana. Instant credit upon confirmation.</p>
                  <div className="flex gap-2 mt-3">
                    {["BTC", "ETH", "SOL"].map(c => (
                      <span key={c} className="px-2 py-0.5 rounded text-xs font-mono bg-secondary/60 text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
            </div>
          </button>

          <button onClick={() => setMode("manual")} className="group text-left p-6 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">Manual Deposit</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Contact our Telegram support team to complete your deposit manually. A session timer will be started to complete your payment.</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">25-minute session window</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
            </div>
          </button>
        </div>
        <Card className="bg-secondary/20 border-warning/20">
          <CardContent className="p-4 flex gap-3 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">Only send supported assets to their respective addresses. Sending wrong assets may result in permanent loss. Minimum deposit: $10.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── On-chain deposit ──────────────────────────────────────────────────────
  if (mode === "onchain") {
    const wallet = WALLETS[selectedCoin];
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode("select")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">On-Chain Deposit</h2>
            <p className="text-sm text-muted-foreground">Send crypto and confirm with your transaction code</p>
          </div>
        </div>

        {/* Coin selector */}
        <div className="flex gap-3">
          {(Object.keys(WALLETS) as (keyof typeof WALLETS)[]).map(coin => {
            const w = WALLETS[coin];
            return (
              <button key={coin} onClick={() => { setSelectedCoin(coin); onchainForm.setValue("currency", coin); }}
                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 text-center ${selectedCoin === coin ? `${w.border} ${w.bg}` : "border-border bg-card/30 hover:border-border/80"}`}>
                <div className={`text-sm font-bold ${selectedCoin === coin ? w.color : "text-muted-foreground"}`}>{coin}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{w.name}</div>
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR + address card */}
          <Card className={`bg-card/50 border-2 ${wallet.border} backdrop-blur-sm`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className={`text-lg font-bold ${wallet.color}`}>{wallet.name} Deposit Address</CardTitle>
              <CardDescription className="text-xs">Send only {wallet.symbol} on the {wallet.network}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5">
              <div className="relative p-3 bg-white rounded-xl shadow-lg w-fit">
                <img src={wallet.qr} alt={`${wallet.symbol} QR Code`} className="w-44 h-44 object-cover rounded-lg" />
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute left-0 right-0 h-0.5 bg-primary/60 shadow-[0_0_8px_2px_rgba(8,145,178,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <div className="w-full space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Wallet Address</label>
                <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg">
                  <code className={`text-xs break-all flex-1 ${wallet.color} font-mono`}>{wallet.address}</code>
                  <button onClick={() => handleCopy(wallet.address)} className="shrink-0 p-1.5 hover:bg-secondary rounded transition-colors">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-3 text-xs">
                <div className="bg-secondary/30 rounded-lg p-3">
                  <div className="text-muted-foreground">Network</div>
                  <div className="font-semibold mt-0.5">{wallet.network}</div>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <div className="text-muted-foreground">Min. Confirmations</div>
                  <div className="font-semibold mt-0.5">{wallet.minConfirm}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form card */}
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Confirm Your Deposit</CardTitle>
              <CardDescription>After sending, enter the amount and your transaction code to credit your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...onchainForm}>
                <form onSubmit={onchainForm.handleSubmit(onOnchainSubmit)} className="space-y-5">
                  <FormField control={onchainForm.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Amount Sent (USD Equivalent)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                          <Input type="number" placeholder="0.00" className="pl-7 bg-background" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={onchainForm.control} name="txnCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Transaction Code</FormLabel>
                      <FormControl>
                        <Input placeholder="TXN-XXXX-XXXX-XXXX-XXXX" className="bg-background font-mono text-sm uppercase tracking-wider" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="p-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">How it works:</p>
                    <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                      <li>Send {wallet.symbol} to the address shown</li>
                      <li>Enter the USD equivalent amount above</li>
                      <li>Enter the transaction code provided to you</li>
                      <li>Click Confirm Deposit — your account is instantly credited</li>
                    </ol>
                  </div>

                  <Button type="submit" className="w-full font-bold" disabled={createDeposit.isPending}>
                    {createDeposit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Confirm Deposit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Manual deposit ────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <button onClick={() => { setMode("select"); setManualStep("amount"); setTimerActive(false); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manual Deposit</h2>
          <p className="text-sm text-muted-foreground">Complete your payment via Telegram</p>
        </div>
      </div>

      {manualStep === "amount" && (
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Enter Deposit Amount</CardTitle>
            <CardDescription>Specify how much you'd like to deposit. A 25-minute session will begin after submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualAmountSubmit)} className="space-y-5">
                <FormField control={manualForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Deposit Amount (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" placeholder="0.00" className="pl-7 bg-background text-lg font-semibold" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map(v => (
                    <button key={v} type="button" onClick={() => manualForm.setValue("amount", v)} className="p-2 rounded-lg border border-border text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all">
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
                <Button type="submit" className="w-full font-bold">
                  Start Deposit Session <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {manualStep === "pending" && (
        <div className="space-y-5">
          {/* Timer card */}
          <Card className="bg-card/50 border-primary/20 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-secondary/50">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${100 - timerPercent}%` }} />
            </div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Session Time Remaining</div>
                <div className={`text-3xl font-bold font-mono tabular-nums ${timeLeft < 300 ? "text-red-400" : "text-primary"}`}>{formatTime(timeLeft)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Deposit Amount</div>
                <div className="text-xl font-bold">${manualAmount.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">1</div>
                <div>
                  <p className="font-semibold text-sm">Contact our support team</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Message our Telegram bot to initiate your deposit session. Reference your deposit amount in the message.</p>
                  <a href="https://t.me/AverNoxTraderbot" target="_blank" rel="noreferrer">
                    <Button size="sm" className="mt-2 text-xs font-semibold">
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Open Telegram Bot
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">2</div>
                <div>
                  <p className="font-semibold text-sm">Complete your payment</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Follow the payment instructions provided by our team. Send exactly <strong className="text-foreground">${manualAmount.toLocaleString()}</strong> as instructed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">3</div>
                <div className="w-full">
                  <p className="font-semibold text-sm">Enter your transaction code</p>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2 leading-relaxed">After payment, you'll receive a transaction code. Enter it below to credit your account.</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="TXN-XXXX-XXXX-XXXX-XXXX"
                      className="bg-background font-mono text-sm uppercase tracking-wider"
                      value={manualForm.watch("txnCode")}
                      onChange={e => manualForm.setValue("txnCode", e.target.value.toUpperCase())}
                    />
                    <Button onClick={onManualTxnSubmit} className="shrink-0 font-bold" disabled={createDeposit.isPending}>
                      {createDeposit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {manualStep === "expired" && (
        <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-destructive">Session Expired</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Your deposit session has timed out. Please start a new session to complete your deposit.</p>
            </div>
            <Button onClick={() => { setManualStep("amount"); setTimerActive(false); }} className="font-bold">
              Start New Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
