import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Splash from "@/pages/splash";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Deposit from "@/pages/deposit";
import Invest from "@/pages/invest";
import Portfolio from "@/pages/portfolio";
import Market from "@/pages/market";
import Withdrawals from "@/pages/withdrawals";
import History from "@/pages/history";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Protected Routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/deposit" component={Deposit} />
      <ProtectedRoute path="/invest" component={Invest} />
      <ProtectedRoute path="/portfolio" component={Portfolio} />
      <ProtectedRoute path="/market" component={Market} />
      <ProtectedRoute path="/withdrawals" component={Withdrawals} />
      <ProtectedRoute path="/history" component={History} />
      <ProtectedRoute path="/notifications" component={Notifications} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/support" component={Support} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
