import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (token) {
          setLocation("/dashboard");
        } else {
          setLocation("/login");
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [token, isLoading, setLocation]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-1000">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-3xl font-black text-background tracking-tighter">AX</span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-accent animate-ping" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-widest text-primary">AVERNOX</h1>
          <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
            TraderBot
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-center space-y-1">
        <p className="text-xs text-muted-foreground/60 font-mono tracking-wider">
          An AverCore Technology.
        </p>
        <p className="text-[10px] text-muted-foreground/40 font-mono">
          INITIALIZING QUANTUM MODULES...
        </p>
      </div>
    </div>
  );
}
