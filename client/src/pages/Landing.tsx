import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { user, isLoading, refetch } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if login was successful
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Wait a bit then refetch user data
      setTimeout(() => {
        refetch();
      }, 100);
    }
  }, [refetch]);

  // Show loading when checking auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (response.ok) {
          refetch();
        }
      } catch (error) {
        // User not authenticated, continue showing landing
      }
    };
    
    // Check immediately and then every few seconds
    checkAuth();
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return null;
  if (user) {
    useEffect(() => {
      setLocation('/dashboard');
    }, []);
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Hero/Brand */}
      <div className="flex-1 lg:w-1/2 bg-slate-900 relative overflow-hidden flex flex-col justify-center p-8 lg:p-16 text-white">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-50" />
        
        <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/10">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span>Estratégia de Conteúdo com IA</span>
          </div>
          
          <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight mb-6">
            Pautas Automatizadas a partir de suas Fontes
          </h1>
          
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Otimize seu fluxo de conteúdo. Colete fontes, analise tópicos e gere pautas de alta qualidade em segundos com BriefFlow.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Coleta Inteligente de Fontes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Pautas Geradas Automaticamente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Gestão Multi-cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Análise de Tópicos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-3xl text-foreground">Bem-vindo de Volta</h2>
            <p className="mt-2 text-muted-foreground">
              Entre para gerenciar seus clientes e conteúdo
            </p>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              onClick={() => setLocation('/auth')}
            >
              Fazer Login
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-8">
              Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
