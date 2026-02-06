import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Sources from "@/pages/Sources";
import Contents from "@/pages/Contents";
import Briefs from "@/pages/Briefs";
import ClientDetails from "@/pages/ClientDetails";
import BriefDetail from "@/pages/BriefDetail";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect handled by Auth logic or simple replace
    window.location.href = "/";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/clients">
        <ProtectedRoute component={Clients} />
      </Route>
      <Route path="/clients/:id">
        <ProtectedRoute component={ClientDetails} />
      </Route>
      <Route path="/briefs/:id">
        <ProtectedRoute component={BriefDetail} />
      </Route>
<Route path="/sources">
        <ProtectedRoute component={Sources} />
      </Route>
      <Route path="/contents">
        <ProtectedRoute component={Contents} />
      </Route>
      <Route path="/briefs">
        <ProtectedRoute component={Briefs} />
      </Route>
      <Route path="/briefs/:id">
        <ProtectedRoute component={BriefDetail} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
