import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;

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
            <span>AI-Powered Content Strategy</span>
          </div>
          
          <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight mb-6">
            Automated Content Briefs from your Sources
          </h1>
          
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Streamline your content workflow. Collect sources, analyze topics, and generate high-quality briefs in seconds with BriefFlow.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Intelligent Source Scraping</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Auto-Generated Briefs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Multi-Client Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Topic Analysis</span>
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
            <h2 className="font-display font-bold text-3xl text-foreground">Welcome Back</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to manage your clients and content
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign in with Replit
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-8">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
