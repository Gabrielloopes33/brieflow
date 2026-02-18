
import { MOCK_METRICS } from "@/lib/mockData";
import { MetricCard } from "@/components/ui/MetricCard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Instagram, Facebook, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export function Dashboard() {
  return (
    <AppShell>
      <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto">

        {/* Mini Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          <MetricCard
            title="Alcance Insta"
            value={MOCK_METRICS.instagram.reach}
            change={MOCK_METRICS.instagram.growth}
            trend="up"
            icon={<Instagram size={16} />}
          />
          <MetricCard
            title="Engajamento FB"
            value={MOCK_METRICS.facebook.engagement}
            change={MOCK_METRICS.facebook.growth}
            trend="down"
            icon={<Facebook size={16} />}
          />
          <MetricCard
            title="Cliques Google"
            value={MOCK_METRICS.google.clicks}
            change="+12%"
            trend="up"
            icon={<Search size={16} />}
          />
          <MetricCard
            title="Total de Posts"
            value="142"
            change="+5"
            trend="neutral"
            icon={<div className="w-4 h-4 bg-primary rounded-sm" />}
          />
        </div>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">

          {/* Chat Area (Center) */}
          <div className="md:col-span-8 h-full flex flex-col min-h-0">
            <div className="h-full">
              <ChatInterface />
            </div>
          </div>

          {/* Quick References / Knowledge (Right Side) */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-4 overflow-y-auto pr-2">
            <div className="bg-card border border-border p-5 rounded-xl">
              <h3 className="font-display font-semibold mb-3 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-primary" />
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary hover:text-white text-sm transition-colors border border-transparent hover:border-border">
                  ✨ Gerar Ideia de Post
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary hover:text-white text-sm transition-colors border border-transparent hover:border-border">
                  📊 Auditar Concorrente
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary hover:text-white text-sm transition-colors border border-transparent hover:border-border">
                  📅 Agendar Conteúdo
                </button>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl flex-1">
              <h3 className="font-display font-semibold mb-3">Conhecimentos Recentes</h3>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-background/50 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="text-xs text-primary mb-1">REFERÊNCIA</div>
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">Como usar IA para SEO em 2025</div>
                    <div className="text-xs text-muted-foreground mt-2">Adicionado há 2 dias</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
  )
}
