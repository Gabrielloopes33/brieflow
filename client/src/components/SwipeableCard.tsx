import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, Archive } from 'lucide-react';
import { useHaptics } from '@/hooks/use-haptics';

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  deleteThreshold?: number; 
  className?: string;
}

export function SwipeableCard({ 
  children, 
  onDelete, 
  onArchive,
  deleteThreshold = 100,
  className 
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const { triggerHaptic } = useHaptics();
  
  const deleteOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  const archiveOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > deleteThreshold) {
      if (info.offset.x < 0 && onDelete) {
        triggerHaptic('heavy');
        onDelete();
      } else if (info.offset.x > 0 && onArchive) {
        triggerHaptic('heavy');
        onArchive();
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-destructive/10">
        <motion.div style={{ opacity: deleteOpacity }}>
          <Trash2 className="w-6 h-6 text-destructive" />
        </motion.div>
        <motion.div style={{ opacity: archiveOpacity }}>
          <Archive className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
