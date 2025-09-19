import { useCallback, useEffect, useRef } from 'react';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';

export function useTelegramPerformance() {
  const { webApp, haptics } = useEnhancedTelegramWebApp();
  const performanceRef = useRef({
    startTime: Date.now(),
    navigationCount: 0,
    lastInteraction: Date.now()
  });

  // Optimized haptic feedback with throttling
  const throttledHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    const now = Date.now();
    if (now - performanceRef.current.lastInteraction > 100) { // 100ms throttle
      haptics[type]();
      performanceRef.current.lastInteraction = now;
    }
  }, [haptics]);

  // Performance monitoring
  const trackNavigation = useCallback(() => {
    performanceRef.current.navigationCount++;
    throttledHaptic('light');
  }, [throttledHaptic]);

  // Optimize viewport for performance
  const optimizeViewport = useCallback(() => {
    try {
      if (webApp?.isInitialized) {
        // Enable smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Optimize for 60fps
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            document.body.style.transform = 'translateZ(0)'; // Enable hardware acceleration
          });
        }
      }
    } catch (error) {
      console.warn('Performance optimization failed:', error);
    }
  }, [webApp]);

  useEffect(() => {
    optimizeViewport();
  }, [optimizeViewport]);

  return {
    haptic: throttledHaptic,
    trackNavigation,
    performanceMetrics: performanceRef.current
  };
}