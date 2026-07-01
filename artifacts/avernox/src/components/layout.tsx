import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Activity, Bell, Wallet, PieChart, History, Settings, LogOut, ArrowRightLeft, ShieldAlert } from "lucide-react";
import { useGetNotifications } from "@workspace/api-client-react";

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
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-wider text-primary">AVERNOX</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">TraderBot</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="md:hidden">
            <h1 className="text-lg font-bold text-primary">AVERNOX</h1>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="text-xs text-primary">{user?.accountStatus}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold text-primary">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
        <Link href="/settings">
          <div className={`flex flex-col items-center gap-1 p-2 ${location === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
