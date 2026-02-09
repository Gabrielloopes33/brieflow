import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  FileText, 
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientContext } from '@/contexts/ClientContext';

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Clientes', icon: Users, path: '/clients' },
  { label: 'Conteúdos', icon: Globe, path: '/contents' },
  { label: 'Pautas', icon: FileText, path: '/briefs' },
  { label: 'Perfil', icon: User, path: '/profile' },
];

interface BottomNavProps {
  onFabClick?: () => void;
  fabVisible?: boolean;
}

export function BottomNav({ onFabClick, fabVisible = true }: BottomNavProps) {
  const [location] = useLocation();
  const { activeClientId } = useClientContext();
  
  const activePath = location.split('?')[0]; // Remove query params

  const isActive = (path: string) => {
    if (activeClientId && path.startsWith('/workspace')) {
      return activePath.startsWith('/workspace');
    }
    return activePath === path;
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 z-40 md:hidden"
    >
      <div className="flex items-center justify-around h-full px-2">
        {/* Botões esquerda */}
        {navItems.slice(0, 2).map((item) => (
          <NavButton
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
          />
        ))}

        {/* FAB central */}
        {fabVisible && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.05 }}
            onClick={onFabClick}
            className="relative -top-4 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <motion.span
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold"
            >
              +
            </motion.span>
            
            <AnimatePresence>
              {isActive('/workspace') && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full ring-2 ring-primary/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
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
    </motion.nav>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
}

function NavButton({ item, isActive }: NavButtonProps) {
  const Icon = item.icon;

  return (
    <Link href={item.path}>
      <motion.div
        whileTap={{ scale: 0.92 }}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-full py-2 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            scale: isActive ? 1.1 : 1,
            y: isActive ? -2 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
        </motion.div>

        <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
      </motion.div>
    </Link>
  );
}
