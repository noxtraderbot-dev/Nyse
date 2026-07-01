import { useGetNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, AlertTriangle, Target, Activity, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useGetNotifications();
  const markReadMutation = useMarkNotificationRead();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'TRADE_ALERT': return <Activity className="w-4 h-4" />;
      case 'MARKET_IMPACT': return <AlertTriangle className="w-4 h-4" />;
      case 'GOAL_HIT': return <Target className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getColorClass = (type: string, read: boolean) => {
    if (read) return 'text-muted-foreground bg-secondary/50';
    
    switch (type.toUpperCase()) {
      case 'TRADE_ALERT': return 'text-primary bg-primary/10 border-primary/20';
      case 'MARKET_IMPACT': return 'text-warning bg-warning/10 border-warning/20';
      case 'GOAL_HIT': return 'text-success bg-success/10 border-success/20';
      default: return 'text-foreground bg-secondary border-border';
    }
  };

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ data: { id } }, {
      onSuccess: () => {
        // Optimistic update
        queryClient.setQueryData(['/api/notifications'], (old: any) => {
          if (!old) return old;
          return old.map((n: any) => n.id === id ? { ...n, read: true } : n);
        });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Command Center</h2>
        <p className="text-sm text-muted-foreground">System alerts and quantum execution notifications.</p>
      </div>

      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 sm:p-6 flex gap-4 transition-colors relative ${!notification.read ? 'bg-secondary/10' : 'hover:bg-secondary/30'}`}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className={`p-2.5 rounded-full shrink-0 h-fit border ${getColorClass(notification.type, notification.read)}`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                      <h4 className={`font-bold text-sm tracking-wide ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                        {notification.createdAt}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="shrink-0 flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={markReadMutation.isPending}
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>No notifications in queue.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
