import { useGetDeposits, useGetWithdrawals } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function History() {
  const { data: deposits, isLoading: loadingDeposits } = useGetDeposits();
  const { data: withdrawals, isLoading: loadingWithdrawals } = useGetWithdrawals();

  if (loadingDeposits || loadingWithdrawals) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'FAILED':
      case 'REVERSED':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'bg-success/10 text-success border-success/20';
      case 'FAILED':
      case 'REVERSED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Transaction History</h2>
        <p className="text-sm text-muted-foreground">Ledger of all deposits and withdrawals.</p>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/50 p-1">
          <TabsTrigger value="deposits" className="text-xs uppercase tracking-widest font-bold data-[state=active]:bg-card data-[state=active]:text-primary">
            Deposits
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs uppercase tracking-widest font-bold data-[state=active]:bg-card data-[state=active]:text-primary">
            Withdrawals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="mt-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {deposits && deposits.length > 0 ? (
                  deposits.map((deposit) => (
                    <div key={deposit.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-success/10 text-success shrink-0">
                          <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold tracking-wide">Deposit</span>
                            <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0 rounded ${getStatusColor(deposit.status)}`}>
                              {deposit.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            TxID: {deposit.txnCode.substring(0, 16)}...
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                        <span className="text-[10px] text-muted-foreground font-mono mb-1">{deposit.createdAt}</span>
                        <div className="text-right flex items-center gap-2 sm:block">
                          <div className="font-bold font-mono text-success text-lg tracking-tight">
                            +${deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs font-mono font-medium text-muted-foreground sm:mt-0.5">
                            via {deposit.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    No deposits found on record.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {withdrawals && withdrawals.length > 0 ? (
                  withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="p-3 rounded-full bg-destructive/10 text-destructive shrink-0 mt-1 sm:mt-0">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold tracking-wide">Withdrawal</span>
                            <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0 rounded flex items-center gap-1 ${getStatusColor(withdrawal.status)}`}>
                              {getStatusIcon(withdrawal.status)}
                              {withdrawal.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mb-1 break-all">
                            To: {withdrawal.walletAddress.substring(0, 8)}...{withdrawal.walletAddress.substring(withdrawal.walletAddress.length - 8)}
                          </div>
                          {withdrawal.failureReason && (
                            <div className="text-[10px] text-destructive/80 font-mono mt-1 border border-destructive/20 p-1.5 rounded bg-destructive/5 inline-block">
                              ERR: {withdrawal.failureReason}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                        <span className="text-[10px] text-muted-foreground font-mono mb-1">{withdrawal.createdAt}</span>
                        <div className="text-right flex items-center gap-2 sm:block">
                          <div className="font-bold font-mono text-foreground text-lg tracking-tight">
                            -${withdrawal.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs font-mono font-medium text-muted-foreground sm:mt-0.5">
                            {withdrawal.cryptoAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {withdrawal.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    No withdrawals found on record.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
