import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

const logoUrl = `${import.meta.env.BASE_URL}aver-logo.jpeg`;

export default function Splash() {
  const [, setLocation] = useLocation();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (token) setLocation("/dashboard");
        else setLocation("/login");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [token, isLoading, setLocation]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#050d1a] text-foreground overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Radial glow behind logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] animate-orb" />
      </div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-600/8 blur-[80px] animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-cyan-400/6 blur-[60px] animate-float-delayed" />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-scan absolute inset-0" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30" />

      {/* Main logo */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <div className="relative animate-float">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl scale-110 animate-pulse" />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-cyan-500/30 animate-glow shadow-2xl">
            <img
              src={logoUrl}
              alt="AverNox"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Live indicator dot */}
          <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-400 ring-2 ring-[#050d1a] animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-[0.3em] text-white uppercase">AverNox</h1>
          <p className="text-xs font-semibold text-cyan-400 tracking-[0.5em] uppercase">TraderBot</p>
          <p className="text-[10px] text-slate-500 tracking-widest font-mono mt-2">NYSE CERTIFIED PLATFORM</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_auto]" style={{ animation: "ticker-scroll 3s ease-out forwards", width: "100%" }} />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-10 text-center space-y-1.5 z-10">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          SYSTEMS ONLINE
          <span className="mx-2">·</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          AI ENGINE READY
        </div>
        <p className="text-[10px] text-slate-700 font-mono tracking-wider">An AverCore Technology. Built by NYSE.</p>
      </div>
    </div>
  );
}
