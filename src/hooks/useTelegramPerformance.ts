import { useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage?: number;
  viewport: {
    width: number;
    height: number;
    isExpanded: boolean;
  };
  connectionType?: string;
}

export function useTelegramPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const { webApp, isReady, hapticFeedback } = useTelegramWebApp();

  useEffect(() => {
    const initializePerformanceOptimizations = async () => {
      try {
        if (!webApp || !isReady) {
          logger.warn('Telegram WebApp not ready for performance optimization');
          return;
        }

        // Optimize Telegram WebApp settings
        if (typeof webApp.ready === 'function') {
          webApp.ready();
        }
        
        if (typeof webApp.expand === 'function') {
          webApp.expand();
        }

        // Monitor viewport changes for responsive optimization
        const handleViewportChange = () => {
          const newMetrics: PerformanceMetrics = {
            loadTime: performance.now(),
            viewport: {
              width: webApp.viewportStableHeight || window.innerWidth,
              height: webApp.viewportStableHeight || window.innerHeight,
              isExpanded: webApp.isExpanded || false
            },
            memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined,
            connectionType: (navigator as any).connection?.effectiveType || undefined
          };
          
          setMetrics(newMetrics);
          logger.telegramAction('viewport_changed', { metrics: newMetrics });
        };

        // Initial metrics
        handleViewportChange();
        
        // Memory and performance monitoring for 500+ users
        const monitorPerformance = () => {
          const memory = (performance as any).memory;
          if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
            logger.warn('High memory usage detected', {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit
            });
          }
        };

        // Monitor every 30 seconds
        const performanceInterval = setInterval(monitorPerformance, 30000);
        
        setIsOptimized(true);
        logger.telegramAction('performance_optimization_complete');

        return () => {
          clearInterval(performanceInterval);
        };
      } catch (error) {
        logger.error('Failed to initialize Telegram performance optimizations', error);
      }
    };

    if (isReady) {
      initializePerformanceOptimizations();
    }
  }, [webApp, isReady]);

  const triggerHapticFeedback = (type: 'impact' | 'notification' | 'selection' = 'selection') => {
    try {
      if (hapticFeedback) {
        switch (type) {
          case 'impact':
            hapticFeedback.impact('medium');
            break;
          case 'notification':
            hapticFeedback.notification('success');
            break;
          case 'selection':
            hapticFeedback.selection();
            break;
        }
      }
    } catch (error) {
      logger.debug('Haptic feedback not available', { error });
    }
  };

  const optimizeForMobile = () => {
    try {
      // Disable zoom and scroll for better performance
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Optimize touch interactions
      document.body.style.touchAction = 'manipulation';
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).webkitTouchCallout = 'none';

      logger.telegramAction('mobile_optimization_applied');
    } catch (error) {
      logger.error('Failed to apply mobile optimizations', error);
    }
  };

  return {
    metrics,
    isOptimized,
    triggerHapticFeedback,
    optimizeForMobile
  };
}