import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
    { href: "/clients", icon: Users, label: "Clientes" },
    { href: "/sources", icon: Search, label: "Fontes" },
    { href: "/contents", icon: Globe, label: "Conteúdos" },
    { href: "/briefs", icon: FileText, label: "Pautas" },
    { href: "/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <div className="h-screen w-64 bg-card border-r flex flex-col fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="p-6 border-b flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">BriefFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t bg-muted/20">
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
      </div>
    </div>
  );
}
