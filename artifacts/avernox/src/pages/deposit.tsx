import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateDeposit } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const depositSchema = z.object({
  currency: z.string().min(1, "Please select a currency"),
  amount: z.coerce.number().min(10, "Minimum deposit is $10"),
  txnCode: z.string().min(5, "Transaction code is required"),
});

const WALLETS = {
  BTC: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&bgcolor=111827&color=0891b2",
    name: "Bitcoin"
  },
  ETH: {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F&bgcolor=111827&color=0891b2",
    name: "Ethereum (ERC-20)"
  },
  SOL: {
    address: "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH&bgcolor=111827&color=0891b2",
    name: "Solana"
  }
};

export default function Deposit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const createDeposit = useCreateDeposit();

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      currency: "BTC",
      amount: 0,
      txnCode: "",
    },
  });

  const selectedCurrency = form.watch("currency") as keyof typeof WALLETS;
  const currentWallet = WALLETS[selectedCurrency];

  const handleCopy = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  function onSubmit(values: z.infer<typeof depositSchema>) {
    createDeposit.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Deposit Submitted",
          description: "Your deposit is being verified by our system.",
        });
        setLocation("/history");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error.message || "Failed to process deposit.",
        });
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Fund Account</h2>
        <p className="text-sm text-muted-foreground">Securely deposit crypto assets to your trading account.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm order-2 md:order-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Deposit Details</CardTitle>
            <CardDescription>Enter the details of your transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">USD Amount Equivalent</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input type="number" placeholder="0.00" className="pl-7 bg-background" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="txnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Transaction Hash / ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter TxHash from your wallet" className="bg-background font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full font-bold tracking-widest" disabled={createDeposit.isPending}>
                  {createDeposit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  VERIFY DEPOSIT
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6 order-1 md:order-2">
          <Card className="bg-card/50 border-primary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(8,145,178,0.1)]">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg font-bold">{currentWallet?.name} Deposit Address</CardTitle>
              <CardDescription>Send only {selectedCurrency} to this address</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="p-4 bg-white rounded-xl shadow-inner relative overflow-hidden group">
                {currentWallet && (
                  <img 
                    src={currentWallet.qr} 
                    alt={`${selectedCurrency} QR Code`}
                    className="w-48 h-48 object-contain"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/5 to-primary/20 pointer-events-none" />
                {/* Scanner animation line */}
                <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(8,145,178,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>

              <div className="w-full space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Wallet Address</label>
                <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-md">
                  <code className="text-xs break-all flex-1 text-primary/80">{currentWallet?.address}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-secondary" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-warning/20">
            <CardContent className="p-4 flex gap-3 text-sm text-muted-foreground">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning mb-1">Important Safety Notice</p>
                <p className="text-xs leading-relaxed">
                  Send only {currentWallet?.name} to this deposit address. Sending any other coin or token to this address may result in the loss of your deposit. Minimum deposit is $10 USD equivalent.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
