import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  FileText, 
  User,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientContext } from '@/contexts/ClientContext';
import { useHaptics } from '@/hooks/use-haptics';

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

interface BottomNavProps {
  onFabClick?: () => void;
  fabVisible?: boolean;
  activeClientId?: string;
}

export function BottomNav({ onFabClick, fabVisible = true, activeClientId }: BottomNavProps) {
  const [location] = useLocation();
  const { activeClientId: contextClientId } = useClientContext();
  const { triggerHaptic } = useHaptics();
  
  const activePath = location.split('?')[0]; 
  const currentClientId = activeClientId || contextClientId;

  const navItems: NavItem[] = [
    { label: 'Painel', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Clientes', icon: Users, path: '/clients' },
    { label: 'Conteudos', icon: Globe, path: currentClientId ? `/workspace/${currentClientId}?tab=contents` : '/contents' },
    { label: 'Pautas', icon: FileText, path: '/briefs' },
    { label: 'Perfil', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (activeClientId && path.startsWith('/workspace')) {
      return activePath.startsWith('/workspace');
    }
    return activePath === path;
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
    >
      {/* Floating Dock Container */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 px-2 py-3 relative overflow-hidden"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
        
        <div className="flex items-center justify-around relative z-10">
          {/* Botões esquerda */}
          {navItems.slice(0, 2).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
            />
          ))}

          {/* FAB central com efeito de glow */}
          {fabVisible && (
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.1, y: -4 }}
                onClick={() => {
                  triggerHaptic('medium');
                  onFabClick?.();
                }}
                className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/20"
              >
                <motion.span
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-bold"
                >
                  <Plus className="w-6 h-6" />
                </motion.span>
              </motion.button>
            </div>
          )}

          {/* Botões direita */}
          {navItems.slice(2).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
            />
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
}

function NavButton({ item, isActive }: NavButtonProps) {
  const Icon = item.icon;
  const { triggerHaptic } = useHaptics();

  return (
    <Link href={item.path}>
      <motion.div
        whileTap={{ scale: 0.92 }}
        onClick={() => triggerHaptic('light')}
        className={cn(
          "relative flex flex-col items-center justify-center w-14 h-14 transition-colors rounded-xl",
          isActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary/10 rounded-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            scale: isActive ? 1.15 : 1,
            y: isActive ? -2 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10"
        >
          <Icon className={cn("w-6 h-6", isActive && "text-primary")} strokeWidth={isActive ? 2.5 : 2} />
        </motion.div>

        <span className={cn(
          "text-[10px] font-medium mt-0.5 relative z-10",
          isActive ? "text-primary" : ""
        )}>
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
}
