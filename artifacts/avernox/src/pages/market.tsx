import { useGetTrendingAssets, useGetTradeAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, BellRing, Activity, AlertTriangle } from "lucide-react";

export default function Market() {
  const { data: trending, isLoading: loadingTrending } = useGetTrendingAssets();
  const { data: alerts, isLoading: loadingAlerts } = useGetTradeAlerts();

  if (loadingTrending || loadingAlerts) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM': return 'bg-warning/10 text-warning border-warning/20';
      case 'LOW': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Market Intelligence</h2>
        <p className="text-sm text-muted-foreground">Real-time market data and quantitative alerts.</p>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
          <TabsTrigger value="trending" className="text-xs uppercase tracking-widest font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Trending Assets
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs uppercase tracking-widest font-bold data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Trade Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-success/20 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 bg-success/5">
                <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2 text-success">
                  <TrendingUp className="w-4 h-4" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {trending?.gainers.map((asset) => (
                    <div key={asset.symbol} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div>
                        <div className="font-bold tracking-wide">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                        <div className="text-xs font-mono text-success flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +{asset.changePercent24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-destructive/20 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 bg-destructive/5">
                <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2 text-destructive">
                  <TrendingDown className="w-4 h-4" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {trending?.losers.map((asset) => (
                    <div key={asset.symbol} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                      <div>
                        <div className="font-bold tracking-wide">{asset.symbol}</div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                        <div className="text-xs font-mono text-destructive flex items-center justify-end gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {asset.changePercent24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2">
                <BellRing className="w-4 h-4 text-primary" />
                Quantitative Market Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                    <div className="shrink-0 pt-1">
                      <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold tracking-wide text-sm">{alert.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] font-mono rounded-sm px-1.5 uppercase ${getImpactColor(alert.impact)}`}>
                            {alert.impact} IMPACT
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">{alert.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="pt-2">
                        <Badge variant="secondary" className="text-xs font-mono bg-background text-foreground border-border">
                          TARGET ASSET: {alert.asset}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No active quantitative alerts.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
