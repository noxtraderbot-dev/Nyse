import { useState, useEffect } from "react";
import { useGetActiveInvestment, useGetInvestmentTrades, useRefreshTrades } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Activity, TrendingUp, TrendingDown, Clock, Target, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Invest() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: investment, isLoading: loadingInvestment, refetch: refetchInvestment } = useGetActiveInvestment();
  const { data: trades, isLoading: loadingTrades, refetch: refetchTrades } = useGetInvestmentTrades();
  const refreshMutation = useRefreshTrades();

  // Simulated live updates for the UI feel
  const [liveIndicator, setLiveIndicator] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndicator(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshMutation.mutate(undefined, {
      onSuccess: () => {
        refetchInvestment();
        refetchTrades();
        toast({
          title: "Feed Synchronized",
          description: "Latest quantum trades retrieved.",
        });
        setIsRefreshing(false);
      },
      onError: () => {
        setIsRefreshing(false);
      }
    });
  };

  if (loadingInvestment || loadingTrades) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Live AI Tracker</h2>
          <p className="text-sm text-muted-foreground">Monitor automated quantum trading activity.</p>
        </div>
        <Card className="bg-card/50 border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <Activity className="h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold">No Active AI Modules</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You currently do not have an active quantum trading module. Fund your account to deploy an AI agent.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProfitable = investment.profitLoss >= 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Live AI Tracker</h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full bg-primary mr-1.5 ${liveIndicator ? 'opacity-100' : 'opacity-40'} transition-opacity`} />
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Real-time quantum execution feed.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="border-primary/20 text-primary font-mono text-xs uppercase tracking-widest"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Sync Feed
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Module Status Card */}
        <Card className="lg:col-span-3 bg-card/50 border-primary/20 shadow-[0_0_30px_rgba(8,145,178,0.05)] backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <CardContent className="p-6 sm:p-8">
            <div className="grid md:grid-cols-4 gap-8">
              
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Initial Capital
                </p>
                <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
                  ${investment.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Current Value
                </p>
                <p className="text-3xl font-bold font-mono tracking-tight text-primary shadow-primary">
                  ${investment.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Target Return
                </p>
                <p className="text-2xl font-bold font-mono tracking-tight text-muted-foreground">
                  ${investment.targetReturn.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                  Net Profit
                </p>
                <p className={`text-2xl font-bold font-mono tracking-tight ${isProfitable ? 'text-success' : 'text-destructive'}`}>
                  {isProfitable ? '+' : '-'}${Math.abs(investment.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm ml-2">({isProfitable ? '+' : ''}{investment.profitLossPercent.toFixed(2)}%)</span>
                </p>
              </div>

            </div>

            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <span>Module Progress</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> {investment.daysRemaining} Days Left
                </span>
              </div>
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_10px_rgba(8,145,178,0.8)] transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(0, investment.progressPercent))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 50%, transparent)',
                    transform: 'translateX(-100%)',
                    backgroundSize: '200% 100%'
                  }}/>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span>{investment.startDate}</span>
                <span>{investment.endDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Feed */}
        <Card className="lg:col-span-3 bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 bg-secondary/20">
            <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Execution Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {trades && trades.length > 0 ? (
                trades.map((trade) => {
                  const isWin = trade.status === "WIN";
                  const Icon = isWin ? TrendingUp : TrendingDown;
                  const colorClass = isWin ? "text-success" : "text-destructive";
                  const bgClass = isWin ? "bg-success/10" : "bg-destructive/10";
                  
                  return (
                    <div key={trade.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${bgClass} ${colorClass} shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg tracking-wide">{trade.symbol}</span>
                            <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0 rounded ${trade.type === 'BUY' ? 'border-primary/30 text-primary' : 'border-warning/30 text-warning'}`}>
                              {trade.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                            <span>Amount: ${trade.amount.toLocaleString()}</span>
                            <span className="text-border/50">•</span>
                            <span>Entry: ${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                        <span className="text-[10px] text-muted-foreground font-mono mb-1">{trade.executedAt}</span>
                        <div className="text-right">
                          <div className={`font-bold font-mono text-lg tracking-tight ${colorClass}`}>
                            {isWin ? "+" : "-"}${Math.abs(trade.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs font-mono font-medium ${colorClass}`}>
                            {isWin ? "+" : "-"}{Math.abs(trade.profitLossPercent).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No executions logged yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
