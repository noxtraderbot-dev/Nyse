import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Activity, Bell, Wallet, PieChart, History, Settings, LogOut, ArrowRightLeft, ShieldAlert, Zap } from "lucide-react";
import { useGetNotifications } from "@workspace/api-client-react";

const logoUrl = `${import.meta.env.BASE_URL}aver-logo.jpeg`;

const TICKER_ITEMS = [
  { symbol: "BTC/USD", price: "67,234.82", change: "+2.41%", up: true },
  { symbol: "ETH/USD", price: "3,521.14", change: "+1.87%", up: true },
  { symbol: "SOL/USD", price: "182.46", change: "+4.23%", up: true },
  { symbol: "BNB/USD", price: "412.70", change: "-0.54%", up: false },
  { symbol: "XRP/USD", price: "0.6182", change: "+1.12%", up: true },
  { symbol: "ADA/USD", price: "0.4917", change: "-1.30%", up: false },
  { symbol: "DOGE/USD", price: "0.1623", change: "+3.07%", up: true },
  { symbol: "AVAX/USD", price: "38.94", change: "+2.85%", up: true },
  { symbol: "LINK/USD", price: "14.72", change: "-0.21%", up: false },
  { symbol: "DOT/USD", price: "7.18", change: "+1.55%", up: true },
];

function MarketTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="h-8 bg-[#050d1a] border-b border-cyan-500/10 overflow-hidden flex items-center">
      <div className="shrink-0 px-3 border-r border-cyan-500/20 flex items-center gap-1.5 h-full bg-cyan-500/5">
        <Zap className="w-3 h-3 text-cyan-400" />
        <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase whitespace-nowrap">Live</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex animate-ticker whitespace-nowrap">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-[11px] font-mono">
              <span className="text-slate-400 font-bold tracking-wider">{item.symbol}</span>
              <span className="text-white font-semibold">${item.price}</span>
              <span className={item.up ? "text-green-400" : "text-red-400"}>{item.change}</span>
              <span className="text-slate-700">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const { data: notifications } = useGetNotifications({
    query: { enabled: !!user }
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/invest", label: "Live Tracker", icon: PieChart },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/market", label: "Market", icon: ArrowRightLeft },
    { href: "/history", label: "History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/support", label: "Support", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-[#060e1f] relative overflow-hidden">
        {/* Subtle glow orb behind sidebar */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-cyan-500/4 blur-[60px] pointer-events-none" />

        {/* Logo header */}
        <div className="p-5 border-b border-border/60 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/20 shadow-lg shadow-cyan-500/10 shrink-0">
            <img src={logoUrl} alt="AverNox" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white leading-none">AVERNOX</h1>
            <p className="text-[10px] text-cyan-400/80 uppercase tracking-[0.2em] font-semibold mt-0.5">TraderBot</p>
          </div>
        </div>

        {/* AI status badge */}
        <div className="px-5 py-3 border-b border-border/40 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/8 border border-green-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-mono font-semibold text-green-400 tracking-wider uppercase">AI Engine Online</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/60 relative z-10">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-lg bg-white/3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                <p className="text-[10px] text-cyan-400 uppercase tracking-wider">{user.accountStatus}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-500/8 text-xs h-8"
            onClick={logout}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Market ticker */}
        <MarketTicker />

        {/* Topbar */}
        <header className="h-14 border-b border-border bg-[#060e1f]/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/20">
              <img src={logoUrl} alt="AverNox" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-black tracking-wider text-white">AVERNOX</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white w-8 h-8">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                )}
              </Button>
            </Link>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-white">{user?.username}</span>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider">{user?.accountStatus}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#060e1f] border-t border-border flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-semibold tracking-wider">{item.label}</span>
              </div>
            </Link>
          );
        })}
        <Link href="/settings">
          <div className={`flex flex-col items-center gap-1 p-2 ${location === '/settings' ? 'text-cyan-400' : 'text-slate-500'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-semibold tracking-wider">More</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
