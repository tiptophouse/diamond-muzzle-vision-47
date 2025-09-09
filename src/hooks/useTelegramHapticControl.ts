import { useCallback, useRef, useEffect } from 'react';
import { useTelegramSDK } from './useTelegramSDK';

interface HapticControlOptions {
  enableHaptic?: boolean;
  maxHapticsPerSecond?: number;
  debounceTime?: number;
}

export function useTelegramHapticControl(options: HapticControlOptions = {}) {
  const {
    enableHaptic = true,
    maxHapticsPerSecond = 2,
    debounceTime = 500
  } = options;
  
  const { haptic } = useTelegramSDK();
  const lastHapticTime = useRef<number>(0);
  const hapticCount = useRef<number>(0);
  const resetCounterRef = useRef<NodeJS.Timeout>();

  // Reset haptic counter every second
  useEffect(() => {
    const interval = setInterval(() => {
      hapticCount.current = 0;
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const controlledHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic) return;
    
    const now = Date.now();
    const timeSinceLastHaptic = now - lastHapticTime.current;
    
    // Debounce rapid calls
    if (timeSinceLastHaptic < debounceTime) {
      console.log('🔇 Haptic blocked: too soon since last haptic');
      return;
    }
    
    // Rate limit haptic feedback
    if (hapticCount.current >= maxHapticsPerSecond) {
      console.log('🔇 Haptic blocked: rate limit exceeded');
      return;
    }
    
    try {
      haptic.impact(type);
      lastHapticTime.current = now;
      hapticCount.current++;
      console.log('✨ Haptic triggered:', type, 'Count:', hapticCount.current);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [enableHaptic, haptic, debounceTime, maxHapticsPerSecond]);

  const resetHapticLimits = useCallback(() => {
    hapticCount.current = 0;
    lastHapticTime.current = 0;
    console.log('🔄 Haptic limits reset');
  }, []);

  return {
    triggerHaptic: controlledHaptic,
    resetLimits: resetHapticLimits,
    isEnabled: enableHaptic
  };
}