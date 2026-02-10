import { useState } from "react";
import { Search, Menu, Bell, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  onSearch?: (value: string) => void;
  onMenuClick?: () => void;
  showNotificationBadge?: boolean;
}

export function MobileHeader({ 
  onSearch, 
  showNotificationBadge = false 
}: MobileHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 md:hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Menu Button - Sheet Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display font-bold text-lg">BriefFlow</span>
                </div>
              </div>
              <MobileNavItems />
            </div>
          </SheetContent>
        </Sheet>

        {/* Search Bar - Collapsible */}
        <div className="flex-1 relative">
          <motion.div
            animate={{
              width: searchOpen ? "100%" : "60%"
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <Search 
              onClick={() => setSearchOpen(true)}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer",
                searchOpen ? "w-4 h-4 text-muted-foreground" : "w-5 h-5 text-muted-foreground"
              )}
            />
            <Input
              placeholder={searchOpen ? "Buscar..." : ""}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                if (searchValue === "") setSearchOpen(false);
              }}
              className={cn(
                "h-10 pl-10 pr-10 bg-muted/50 border-0 rounded-full transition-all",
                searchOpen ? "bg-muted/80" : ""
              )}
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => {
                  setSearchValue("");
                  handleSearchChange("");
                }}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </motion.div>
        </div>

        {/* Notification Bell */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 h-10 w-10 relative"
        >
          <Bell className="h-5 w-5" />
          {showNotificationBadge && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </div>
    </motion.header>
  );
}

function MobileNavItems() {
  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {[
        { href: "/dashboard", icon: "📊", label: "Painel" },
        { href: "/clients", icon: "👥", label: "Clientes" },
        { href: "/sources", icon: "🔍", label: "Fontes" },
        { href: "/contents", icon: "🌐", label: "Conteúdos" },
        { href: "/briefs", icon: "📝", label: "Pautas" },
        { href: "/settings", icon: "⚙️", label: "Configurações" },
      ].map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
