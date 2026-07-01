import { useGetMe, useGetActiveInvestment, useGetPortfolioSummary, useGetInvestmentTrades } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Activity, Zap, Wallet, TrendingUp, TrendingDown, Clock, Shield, Cpu, Globe } from "lucide-react";

function MiniSparkline({ color, up }: { color: string; up: boolean }) {
  const pts = up
    ? "0,20 15,16 30,18 45,12 60,14 75,8 90,10 105,4 120,6"
    : "0,6 15,8 30,5 45,12 60,10 75,14 90,12 105,18 120,20";
  return (
    <svg viewBox="0 0 120 24" className="w-16 h-6" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: portfolio } = useGetPortfolioSummary();
  const { data: activeInvestment } = useGetActiveInvestment();
  const { data: trades } = useGetInvestmentTrades();
  const recentTrades = trades?.slice(0, 5) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, <span className="text-cyan-400 font-semibold">{user?.username}</span>. Here's your trading summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/deposit">
            <Button className="font-bold tracking-wide bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/20 h-9">
              DEPOSIT <ArrowDownRight className="ml-1.5 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/withdrawals">
            <Button variant="outline" className="font-bold tracking-wide border-cyan-500/20 hover:bg-cyan-500/8 text-slate-300 hover:text-white h-9">
              WITHDRAW <ArrowUpRight className="ml-1.5 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* AI status banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 glass-card">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">AI TRADING ENGINE ACTIVE</p>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider">Quantum algorithms scanning 2,847 market signals · NYSE Certified · Last update: {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase">Latency</p>
            <p className="text-xs font-mono text-green-400 font-bold">12ms</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase">Uptime</p>
            <p className="text-xs font-mono text-cyan-400 font-bold">99.9%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase">Markets</p>
            <p className="text-xs font-mono text-blue-400 font-bold">147</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance */}
        <div className="glass-card-bright rounded-xl p-5 gradient-border relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Balance</span>
            <div className="flex items-center gap-1.5">
              <MiniSparkline color="#06b6d4" up={true} />
              <Wallet className="h-3.5 w-3.5 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            ${portfolio?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
            Invested: ${portfolio?.activeInvestmentValue?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Total Profit */}
        <div className="glass-card-bright rounded-xl p-5 gradient-border relative overflow-hidden group hover:border-green-500/20 transition-all">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-green-500/5 group-hover:bg-green-500/8 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Profit</span>
            <div className="flex items-center gap-1.5">
              <MiniSparkline color="#22c55e" up={true} />
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-green-400 tracking-tight">
            +${portfolio?.totalProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
          <p className="text-[11px] text-green-500/80 mt-1.5 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            {portfolio?.totalProfitPercent?.toFixed(2) || '0.00'}% all time
          </p>
        </div>

        {/* Win Rate */}
        <div className="glass-card-bright rounded-xl p-5 gradient-border relative overflow-hidden group hover:border-blue-500/20 transition-all">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-blue-500/5 group-hover:bg-blue-500/8 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Win Rate</span>
            <div className="flex items-center gap-1.5">
              <MiniSparkline color="#3b82f6" up={true} />
              <Activity className="h-3.5 w-3.5 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {portfolio?.winRate?.toFixed(1) || '0.0'}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
            {portfolio?.totalTrades || 0} automated trades
          </p>
        </div>

        {/* Account Status */}
        <div className="glass-card-bright rounded-xl p-5 gradient-border relative overflow-hidden group hover:border-cyan-500/25 transition-all">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-cyan-500/5 group-hover:bg-cyan-500/8 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Account Status</span>
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black tracking-tight uppercase text-cyan-400">
            {user?.accountStatus || 'PENDING'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
            Alerts {user?.tradeAlertsEnabled ? '● ON' : '○ OFF'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Investment */}
        <div className="glass-card-bright rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Active Quantum Investment</h3>
            </div>
            <Link href="/invest">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 h-7 px-2 text-xs">
                Live Tracker <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="p-5">
            {activeInvestment ? (
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-mono">Current Value</p>
                    <p className="text-3xl font-black font-mono text-cyan-400">${activeInvestment.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-mono">Target</p>
                    <p className="text-xl font-black font-mono text-slate-400">${activeInvestment.targetReturn.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    <span>Progress</span>
                    <span className="text-cyan-400">{activeInvestment.progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(0, activeInvestment.progressPercent))}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5" /> {activeInvestment.daysRemaining}d remaining
                  </span>
                  <span className={`font-mono font-bold text-sm ${activeInvestment.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {activeInvestment.profitLoss >= 0 ? "+" : "-"}${Math.abs(activeInvestment.profitLoss).toLocaleString()} ({activeInvestment.profitLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-cyan-400/50" />
                </div>
                <p className="text-slate-500 mb-4 text-sm">No active investment modules.</p>
                <Link href="/deposit">
                  <Button className="font-bold tracking-widest bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 h-9 text-xs">
                    FUND ACCOUNT
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trade Feed */}
        <div className="glass-card-bright rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Recent Trade Feed</h3>
            </div>
            <Link href="/invest">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 h-7 px-2 text-xs">
                Full Log <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="p-4">
            {recentTrades.length > 0 ? (
              <div className="space-y-2.5">
                {recentTrades.map((trade) => {
                  const isWin = trade.status === "WIN";
                  const Icon = isWin ? TrendingUp : TrendingDown;
                  return (
                    <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5 hover:border-cyan-500/15 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${isWin ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          <Icon className={`w-3.5 h-3.5 ${isWin ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold tracking-wide text-white text-sm">{trade.symbol}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              trade.type === 'BUY' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-yellow-500/15 text-yellow-400'
                            }`}>
                              {trade.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ${trade.amount.toLocaleString()} @ ${trade.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold font-mono text-sm ${isWin ? "text-green-400" : "text-red-400"}`}>
                          {isWin ? "+" : "-"}${Math.abs(trade.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] font-mono ${isWin ? "text-green-500/70" : "text-red-500/70"}`}>
                          {isWin ? "+" : "-"}{Math.abs(trade.profitLossPercent).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Activity className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-500">Awaiting trading activity...</p>
                <p className="text-xs text-slate-600 mt-1">Deposit funds to activate AI trading</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security & Trust row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Shield, label: "SSL Encrypted", sub: "256-bit TLS", color: "text-green-400" },
          { icon: Cpu, label: "AI Engine", sub: "Quantum Grade", color: "text-cyan-400" },
          { icon: Activity, label: "Live Markets", sub: "147 pairs", color: "text-blue-400" },
          { icon: Globe, label: "NYSE Certified", sub: "Reg. compliant", color: "text-purple-400" },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <Icon className={`w-4 h-4 ${color} shrink-0`} />
            <div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-[10px] text-slate-500 font-mono">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
