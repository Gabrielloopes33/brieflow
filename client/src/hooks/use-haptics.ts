import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

export function useHaptics() {
  const triggerHaptic = useCallback((type: HapticType) => {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return; 
    }

    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 40,
      success: [10, 30, 10],
      error: [50, 50, 50],
      selection: 10,
    };

    navigator.vibrate(patterns[type]);
  }, []);

  return { triggerHaptic };
}
