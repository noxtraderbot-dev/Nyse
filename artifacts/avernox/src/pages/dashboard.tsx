import { useGetMe, useGetActiveInvestment, useGetPortfolioSummary, useGetInvestmentTrades } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Activity, Zap, Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: portfolio } = useGetPortfolioSummary();
  const { data: activeInvestment } = useGetActiveInvestment();
  const { data: trades } = useGetInvestmentTrades();

  const recentTrades = trades?.slice(0, 5) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.username}. Here's your trading summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/deposit">
            <Button className="font-bold tracking-wide">
              DEPOSIT
              <ArrowDownRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/withdrawals">
            <Button variant="outline" className="font-bold tracking-wide border-primary/20 hover:bg-primary/10">
              WITHDRAW
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">${portfolio?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active Investment: ${portfolio?.activeInvestmentValue?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight text-success">
              +${portfolio?.totalProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {portfolio?.totalProfitPercent?.toFixed(2) || '0.00'}% all time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tight">{portfolio?.winRate?.toFixed(1) || '0.0'}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {portfolio?.totalTrades || 0} automated trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider text-muted-foreground uppercase">Account Status</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight uppercase text-primary">{user?.accountStatus || 'PENDING'}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Trading alerts {user?.tradeAlertsEnabled ? 'enabled' : 'disabled'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Active Quantum Investment</CardTitle>
            <Link href="/invest">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-8">
                View Tracker <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeInvestment ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Current Value</p>
                    <p className="text-3xl font-bold font-mono text-primary">${activeInvestment.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Target</p>
                    <p className="text-xl font-bold font-mono text-muted-foreground">${activeInvestment.targetReturn.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{activeInvestment.progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary relative" 
                      style={{ width: `${Math.min(100, Math.max(0, activeInvestment.progressPercent))}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" /> {activeInvestment.daysRemaining} days remaining
                  </span>
                  <span className={activeInvestment.profitLoss >= 0 ? "text-success" : "text-destructive"}>
                    {activeInvestment.profitLoss >= 0 ? "+" : "-"}${Math.abs(activeInvestment.profitLoss).toLocaleString()} ({activeInvestment.profitLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground mb-4">No active investment modules.</p>
                <Link href="/deposit">
                  <Button variant="outline" className="font-bold tracking-widest border-primary/20 text-primary">
                    FUND ACCOUNT
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Trade Feed</CardTitle>
            <Link href="/invest">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-8">
                Full Log <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTrades.length > 0 ? (
              <div className="space-y-4">
                {recentTrades.map((trade) => {
                  const isWin = trade.status === "WIN";
                  const Icon = isWin ? TrendingUp : TrendingDown;
                  const colorClass = isWin ? "text-success" : "text-destructive";
                  
                  return (
                    <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md bg-background ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold tracking-wide">{trade.symbol}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${trade.type === 'BUY' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                              {trade.type}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            ${trade.amount.toLocaleString()} @ ${trade.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold font-mono ${colorClass}`}>
                          {isWin ? "+" : "-"}${Math.abs(trade.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs ${colorClass}`}>
                          {isWin ? "+" : "-"}{Math.abs(trade.profitLossPercent).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Awaiting trading activity...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
