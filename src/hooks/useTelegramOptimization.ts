import { useEffect, useState, useCallback } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface TelegramOptimizationState {
  themeParams: any;
  colorScheme: 'light' | 'dark';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  viewportHeight: number;
  isExpanded: boolean;
}

export function useTelegramOptimization() {
  const { webApp } = useTelegramWebApp();
  const { impactOccurred } = useTelegramHapticFeedback();
  
  const [state, setState] = useState<TelegramOptimizationState>({
    themeParams: {},
    colorScheme: 'light',
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    viewportHeight: window.innerHeight,
    isExpanded: false
  });

  // Apply Telegram theme to CSS variables
  const applyTelegramTheme = useCallback(() => {
    if (!webApp?.themeParams) return;

    const root = document.documentElement;
    const theme = webApp.themeParams;

    // Apply Telegram theme colors
    if (theme.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
      root.style.setProperty('--background', theme.bg_color);
    }
    
    if (theme.text_color) {
      root.style.setProperty('--tg-theme-text-color', theme.text_color);
      root.style.setProperty('--foreground', theme.text_color);
    }
    
    if (theme.hint_color) {
      root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
      root.style.setProperty('--muted-foreground', theme.hint_color);
    }
    
    if (theme.link_color) {
      root.style.setProperty('--tg-theme-link-color', theme.link_color);
    }
    
    if (theme.button_color) {
      root.style.setProperty('--tg-theme-button-color', theme.button_color);
      root.style.setProperty('--primary', theme.button_color);
    }
    
    if (theme.button_text_color) {
      root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
      root.style.setProperty('--primary-foreground', theme.button_text_color);
    }
    
    if (theme.secondary_bg_color) {
      root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
      root.style.setProperty('--muted', theme.secondary_bg_color);
    }

    // Update state
    setState(prev => ({
      ...prev,
      themeParams: theme,
      colorScheme: webApp.colorScheme === 'dark' ? 'dark' : 'light'
    }));
  }, [webApp]);

  // Get safe area insets
  const updateSafeAreaInsets = useCallback(() => {
    const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') || '0');
    const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-bottom') || '0');
    const left = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-left') || '0');
    const right = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-right') || '0');

    setState(prev => ({
      ...prev,
      safeAreaInsets: { top, bottom, left, right }
    }));
  }, []);

  // Optimize viewport
  const optimizeViewport = useCallback(() => {
    if (!webApp) return;

    // Expand the app to full height
    if (typeof webApp.expand === 'function') {
      webApp.expand();
      setState(prev => ({ ...prev, isExpanded: true }));
    }

    // Enable closing confirmation
    if (typeof webApp.enableClosingConfirmation === 'function') {
      webApp.enableClosingConfirmation();
    }

    // Set viewport height
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setState(prev => ({ ...prev, viewportHeight: window.innerHeight }));
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, [webApp]);

  // Optimize for iOS
  const optimizeForIOS = useCallback(() => {
    // Disable iOS bounce scroll
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';

    // Enable momentum scrolling for containers
    const containers = document.querySelectorAll('.ios-scroll');
    containers.forEach(container => {
      (container as HTMLElement).style.webkitOverflowScrolling = 'touch';
      (container as HTMLElement).style.overscrollBehavior = 'contain';
    });
  }, []);

  // Performance optimizations
  const applyPerformanceOptimizations = useCallback(() => {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.classList.add('reduce-motion');
    }

    // Optimize memory usage
    if ('memory' in performance && (performance as any).memory?.usedJSHeapSize) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        document.documentElement.classList.add('low-memory');
      }
    }
  }, []);

  // Initialize optimizations
  useEffect(() => {
    if (!webApp) return;

    const cleanup = optimizeViewport();
    applyTelegramTheme();
    updateSafeAreaInsets();
    optimizeForIOS();
    applyPerformanceOptimizations();

    // Listen for theme changes
    const handleThemeChanged = () => {
      applyTelegramTheme();
    };

    const handleViewportChanged = () => {
      updateSafeAreaInsets();
      setState(prev => ({ ...prev, viewportHeight: window.innerHeight }));
    };

    if (webApp.onEvent) {
      webApp.onEvent('themeChanged', handleThemeChanged);
      webApp.onEvent('viewportChanged', handleViewportChanged);
    }

    return () => {
      if (cleanup) cleanup();
      if (webApp.offEvent) {
        webApp.offEvent('themeChanged', handleThemeChanged);
        webApp.offEvent('viewportChanged', handleViewportChanged);
      }
    };
  }, [webApp, applyTelegramTheme, updateSafeAreaInsets, optimizeViewport, optimizeForIOS, applyPerformanceOptimizations]);

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    impactOccurred(type);
  }, [impactOccurred]);

  const openTelegramLink = useCallback((url: string) => {
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [webApp]);

  const shareContent = useCallback((text: string, url?: string) => {
    if (webApp?.share) {
      webApp.share(url ? `${text}\n${url}` : text);
    } else if (navigator.share) {
      navigator.share({ text, url });
    } else {
      // Fallback to clipboard
      navigator.clipboard?.writeText(url ? `${text}\n${url}` : text);
    }
  }, [webApp]);

  return {
    ...state,
    triggerHapticFeedback,
    openTelegramLink,
    shareContent,
    applyTelegramTheme,
    isOptimized: !!webApp
  };
}