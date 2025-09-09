import React, { useEffect, useCallback, useRef } from 'react';
import { useAdvancedTelegramSDK } from '@/hooks/useAdvancedTelegramSDK';
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';

interface TelegramOptimizedLayoutProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  enableAutoSave?: boolean;
  cacheKey?: string;
}

export function TelegramOptimizedLayout({ 
  children, 
  enablePerformanceMonitoring = true,
  enableAutoSave = true,
  cacheKey = 'app_state'
}: TelegramOptimizedLayoutProps) {
  const { 
    dynamicTheme, 
    haptics, 
    navigation, 
    utils, 
    performanceMetrics,
    isReady 
  } = useAdvancedTelegramSDK();
  
  const { set: cacheSet, get: cacheGet } = useTelegramCloudStorage();
  const layoutRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Performance monitoring with Telegram SDK
  useEffect(() => {
    if (!enablePerformanceMonitoring || !isReady) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          console.log('🎨 Performance: First Contentful Paint:', entry.startTime);
        }
        if (entry.entryType === 'layout-shift' && 'value' in entry) {
          console.log('📐 Performance: Layout Shift:', entry.value);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance observer not supported');
    }

    return () => observer.disconnect();
  }, [enablePerformanceMonitoring, isReady]);

  // Intelligent viewport management
  useEffect(() => {
    if (!isReady || !layoutRef.current) return;

    const updateViewport = utils.throttle(() => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Trigger haptic feedback on significant viewport changes
      haptics.light();
    }, 100);

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    
    // Initial call
    updateViewport();

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [isReady, utils, haptics]);

  // Auto-save state to cloud storage
  useEffect(() => {
    if (!enableAutoSave || !isReady) return;

    const saveState = utils.debounce(async () => {
      try {
        const appState = {
          timestamp: Date.now(),
          url: window.location.href,
          performanceMetrics,
          theme: dynamicTheme
        };
        
        await cacheSet(cacheKey, appState, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
        console.log('💾 Auto-saved app state');
      } catch (error) {
        console.error('❌ Failed to auto-save state:', error);
      }
    }, 2000);

    // Save on route changes and important interactions
    const handleStateChange = () => saveState();
    
    window.addEventListener('beforeunload', handleStateChange);
    window.addEventListener('visibilitychange', handleStateChange);

    return () => {
      window.removeEventListener('beforeunload', handleStateChange);
      window.removeEventListener('visibilitychange', handleStateChange);
    };
  }, [enableAutoSave, isReady, cacheKey, cacheSet, utils, performanceMetrics, dynamicTheme]);

  // Optimize images and content loading
  useEffect(() => {
    if (!layoutRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe all images with data-src
    const images = layoutRef.current.querySelectorAll('img[data-src]');
    images.forEach((img) => observerRef.current?.observe(img));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [children]);

  // Enhanced touch interactions
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    haptics.selection();
  }, [haptics]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Prevent zoom on double tap
    e.preventDefault();
  }, []);

  // Apply dynamic theme
  useEffect(() => {
    if (!isReady) return;

    const root = document.documentElement;
    
    // Apply theme with performance optimization
    requestAnimationFrame(() => {
      root.style.setProperty('--tg-primary', dynamicTheme.primary);
      root.style.setProperty('--tg-secondary', dynamicTheme.secondary);
      root.style.setProperty('--tg-background', dynamicTheme.background);
      root.style.setProperty('--tg-text', dynamicTheme.text);
      root.style.setProperty('--tg-accent', dynamicTheme.accent);
      
      // Update CSS variables for components
      root.style.setProperty('--primary', `hsl(from ${dynamicTheme.primary} h s l)`);
      root.style.setProperty('--background', `hsl(from ${dynamicTheme.background} h s l)`);
      root.style.setProperty('--foreground', `hsl(from ${dynamicTheme.text} h s l)`);
    });
  }, [dynamicTheme, isReady]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      ref={layoutRef}
      className="telegram-optimized-layout min-h-screen bg-background text-foreground"
      style={{
        height: 'var(--vh, 100vh)',
        backgroundColor: dynamicTheme.background,
        color: dynamicTheme.text,
        // Advanced optimizations
        contain: 'layout style paint',
        willChange: 'transform',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Performance monitoring overlay */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 bg-black/80 text-white p-2 text-xs">
          <div>Load: {performanceMetrics.loadTime}ms</div>
          <div>Render: {Math.round(performanceMetrics.renderTime)}ms</div>
          <div>API: {performanceMetrics.apiCalls}</div>
          <div>Cache: {performanceMetrics.cacheHits}</div>
        </div>
      )}
      
      {children}
    </div>
  );
}