import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientProvider } from "@/contexts/ClientContext";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { useClients } from "@/hooks/use-clients";
import { ClientWorkspace } from "@/components/ClientWorkspace";
import { SourcesTab } from "@/components/ClientWorkspace/SourcesTab";
import { ContentsTab } from "@/components/ClientWorkspace/ContentsTab";
import { BriefsTab } from "@/components/ClientWorkspace/BriefsTab";
import { SettingsTab } from "@/components/ClientWorkspace/SettingsTab";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import BriefDetail from "@/pages/BriefDetail";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    window.location.href = "/";
    return null;
  }

  return (
    <PageTransition>
      <Component />
    </PageTransition>
  );
}

function AppLayout({ children, showBottomNav = true }: {
  children: React.ReactNode;
  showBottomNav?: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className={cn(
          "flex-1 pb-16 md:pb-0",
          isMobile ? "ml-0" : "md:ml-16 lg:ml-64"
        )}>
          {children}
        </main>
      </div>

      {isMobile && showBottomNav && (
        <BottomNav />
      )}
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <ProtectedRoute component={() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )} />
      </Route>
      <Route path="/clients">
        <ProtectedRoute component={() => (
          <AppLayout>
            <Clients />
          </AppLayout>
        )} />
      </Route>
      <Route path="/clients/:id">
        {(params) => (
          <ProtectedRoute component={() => {
            window.location.href = `/workspace/${params.id}`;
            return null;
          }} />
        )}
      </Route>
      <Route path="/workspace/:clientId">
        {(params) => (
          <ProtectedRoute component={() => (
            <AppLayout>
              <ClientWorkspace
                sourcesTab={SourcesTab}
                contentsTab={ContentsTab}
                briefsTab={BriefsTab}
                settingsTab={SettingsTab}
              />
            </AppLayout>
          )} />
        )}
      </Route>
      <Route path="/briefs/:id">
        <ProtectedRoute component={() => (
          <AppLayout showBottomNav={false}>
            <BriefDetail />
          </AppLayout>
        )} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { data: clients } = useClients();

  return (
    <ClientProvider initialClients={clients || []}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ClientProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
