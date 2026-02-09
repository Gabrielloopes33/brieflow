import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientProvider, useClientContext } from "@/contexts/ClientContext";
import { BottomNav } from "@/components/BottomNav";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Sidebar } from "@/components/Sidebar";
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

  return <Component />;
}

function AppLayout({ children, showBottomNav = true, showFab = true }: {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showFab?: boolean;
}) {
  const isMobile = useIsMobile();
  const { activeClientId } = useClientContext();
  const { data: clients } = useClients();

  const handleFabAction = (action: 'brief' | 'source' | 'client' | 'content') => {
    switch (action) {
      case 'client':
        window.location.href = '/clients';
        break;
      case 'brief':
        window.location.href = activeClientId ? `/workspace/${activeClientId}?tab=briefs` : '/briefs';
        break;
      case 'source':
        window.location.href = activeClientId ? `/workspace/${activeClientId}?tab=sources` : '/sources';
        break;
      case 'content':
        window.location.href = activeClientId ? `/workspace/${activeClientId}?tab=contents` : '/contents';
        break;
    }
  };

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-16 lg:ml-64 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {isMobile && showBottomNav && (
        <BottomNav
          onFabClick={() => {}}
          fabVisible={showFab}
        />
      )}

      {isMobile && showFab && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <FloatingActionButton
            clientId={activeClientId || undefined}
            onAction={handleFabAction}
          />
        </div>
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
          <AppLayout showFab={false}>
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
            <AppLayout showFab={false}>
              <ClientWorkspace
                clientId={params.clientId}
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
          <AppLayout showBottomNav={false} showFab={false}>
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
