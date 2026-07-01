import { useGetPortfolioSummary, useGetPortfolioHoldings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wallet, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";

export default function Portfolio() {
  const { data: summary, isLoading: loadingSummary } = useGetPortfolioSummary();
  const { data: holdings, isLoading: loadingHoldings } = useGetPortfolioHoldings();

  if (loadingSummary || loadingHoldings) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Portfolio Analysis</h2>
        <p className="text-sm text-muted-foreground">Comprehensive breakdown of your assets and performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Net Worth</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">
              ${summary?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deposited: ${summary?.totalDeposited?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Total PNL</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-success">
              +${summary?.totalProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {summary?.totalProfitPercent?.toFixed(2) || '0.00'}% all time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Performance</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">{summary?.winRate?.toFixed(1) || '0.0'}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Win rate over {summary?.totalTrades || 0} trades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base uppercase tracking-widest font-bold">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {holdings && holdings.length > 0 ? (
                holdings.map((holding) => {
                  const isPositive = holding.change24h >= 0;
                  return (
                    <div key={holding.symbol} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                          {holding.symbol[0]}
                        </div>
                        <div>
                          <div className="font-bold tracking-wide">{holding.name} <span className="text-xs text-muted-foreground font-mono ml-1">{holding.symbol}</span></div>
                          <div className="text-sm font-mono text-muted-foreground mt-0.5">
                            {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold font-mono tracking-tight">
                          ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-mono flex items-center justify-end gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(holding.change24h).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No assets currently held in portfolio.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base uppercase tracking-widest font-bold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {holdings?.map((holding) => (
                <div key={`dist-${holding.symbol}`} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-medium uppercase">
                    <span>{holding.symbol}</span>
                    <span>{holding.allocation.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, holding.allocation)}%` }}
                    />
                  </div>
                </div>
              ))}
              
              {(!holdings || holdings.length === 0) && (
                <div className="text-center text-sm text-muted-foreground">
                  Distribution data unavailable.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
