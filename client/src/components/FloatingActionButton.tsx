import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Globe, 
  Plus, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FabAction = 'brief' | 'source' | 'client' | 'content';

interface FabAction {
  id: FabAction;
  icon: typeof FileText;
  label: string;
  color: string;
}

const actions: FabAction[] = [
  { id: 'brief', icon: FileText, label: 'Nova Pauta', color: 'bg-blue-500' },
  { id: 'source', icon: Globe, label: 'Nova Fonte', color: 'bg-purple-500' },
  { id: 'client', icon: Users, label: 'Novo Cliente', color: 'bg-green-500' },
  { id: 'content', icon: FileText, label: 'Novo Conteúdo', color: 'bg-orange-500' },
];

interface FloatingActionButtonProps {
  clientId?: string;
  onAction: (action: FabAction) => void;
  trigger?: React.ReactNode;
}

export function FloatingActionButton({ clientId, onAction, trigger }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: FabAction) => {
    if (!clientId && action === 'source') {
      // Se não tem cliente selecionado, não permite criar fonte
      return;
    }
    onAction(action);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu items */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { 
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.03
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleAction(action.id)}
                    disabled={!clientId && action.id === 'source'}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 rounded-full shadow-lg",
                      action.color,
                      action.color.replace('bg-', 'text-white')
                    )}
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="font-medium">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={toggleOpen}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 z-50"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
