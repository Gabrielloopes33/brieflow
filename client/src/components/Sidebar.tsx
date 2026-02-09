import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useBreakpoints } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Sparkles,
  Search,
  Globe,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
    { href: "/clients", icon: Users, label: "Clientes" },
    { href: "/sources", icon: Search, label: "Fontes" },
    { href: "/contents", icon: Globe, label: "Conteúdos" },
    { href: "/briefs", icon: FileText, label: "Pautas" },
    { href: "/settings", icon: Settings, label: "Configurações" },
  ];

  if (isMobile) {
    return null; // Mobile usa BottomNav
  }

  return (
    <div className={cn(
      "h-screen bg-card border-r flex flex-col fixed left-0 top-0 z-20 transition-all duration-300",
      isDesktop ? "w-64" : "w-16"
    )}>
      {/* Brand */}
      <div className={cn(
        "border-b flex items-center",
        isDesktop ? "p-6 gap-2" : "p-4 justify-center"
      )}>
        <div className="bg-primary/10 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        {isDesktop && (
          <span className="font-display font-bold text-xl tracking-tight">BriefFlow</span>
        )}
      </div>

      {/* Navigation */}
      <TooltipProvider>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                        isDesktop ? "px-3 py-2.5 gap-3" : "p-3 justify-center",
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      {isDesktop && item.label}
                    </div>
                  </Link>
                </TooltipTrigger>
                {!isDesktop && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* User Profile */}
      <div className={cn(
        "border-t bg-muted/20",
        isDesktop ? "p-4" : "p-3"
      )}>
        {isDesktop ? (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Sair</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
