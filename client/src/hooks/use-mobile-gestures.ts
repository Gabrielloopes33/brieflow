import { useMotionValue, PanInfo } from 'framer-motion';
import { useCallback } from 'react';

interface UseMobileGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; 
}

export function useMobileGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: UseMobileGesturesProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    else {
      if (info.offset.y > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (info.offset.y < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.7,
    onDragEnd: handleDragEnd,
    style: { x, y },
  };
}
