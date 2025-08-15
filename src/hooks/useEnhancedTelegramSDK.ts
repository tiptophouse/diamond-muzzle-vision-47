
import { useEffect, useState, useCallback } from 'react';
import { 
  initData, 
  initDataUser, 
  hapticFeedback,
  mainButton,
  backButton,
  viewport,
  themeParams
} from '@telegram-apps/sdk';

interface TelegramSDKFeatures {
  performance: {
    enableSmoothing: () => void;
    optimizeForIOS: () => void;
    enableVirtualization: () => void;
  };
  haptics: {
    impact: (style: 'light' | 'medium' | 'heavy') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  navigation: {
    setMainButton: (text: string, onClick: () => void) => void;
    hideMainButton: () => void;
    setBackButton: (onClick: () => void) => void;
    hideBackButton: () => void;
  };
  ui: {
    expand: () => void;
    setHeaderColor: (color: string) => void;
    enableClosingConfirmation: () => void;
  };
  data: {
    getInitData: () => string;
    getUserData: () => any;
  };
}

export function useEnhancedTelegramSDK(): TelegramSDKFeatures {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      // Initialize all SDK components
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn('Telegram SDK initialization failed:', error);
    }
  }, []);

  const performance = {
    enableSmoothing: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        // Enable smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Optimize scroll performance
        const scrollElements = document.querySelectorAll('.smooth-scroll');
        scrollElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.transform = 'translateZ(0)';
          element.style.willChange = 'scroll-position';
        });
      } catch (error) {
        console.warn('Performance smoothing failed:', error);
      }
    }, [isInitialized]),

    optimizeForIOS: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          // iOS-specific optimizations
          document.body.style.webkitUserSelect = 'none';
          document.body.style.webkitTouchCallout = 'none';
          document.body.style.webkitTapHighlightColor = 'transparent';
          
          // Fix iOS scroll issues
          const scrollElements = document.querySelectorAll('.overflow-auto, .overflow-y-auto');
          scrollElements.forEach(el => {
            const element = el as HTMLElement;
            // Use setProperty for vendor-prefixed properties
            element.style.setProperty('-webkit-overflow-scrolling', 'touch');
            element.style.setProperty('overflow-scrolling', 'touch');
          });
        }
      } catch (error) {
        console.warn('iOS optimization failed:', error);
      }
    }, [isInitialized]),

    enableVirtualization: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        // Enable hardware acceleration for lists
        const listElements = document.querySelectorAll('[data-virtualized]');
        listElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.transform = 'translateZ(0)';
          element.style.willChange = 'transform';
        });
      } catch (error) {
        console.warn('Virtualization failed:', error);
      }
    }, [isInitialized])
  };

  const haptics = {
    impact: useCallback((style: 'light' | 'medium' | 'heavy') => {
      if (!isInitialized) return;
      
      try {
        hapticFeedback.impactOccurred(style);
      } catch (error) {
        console.warn('Haptic impact failed:', error);
      }
    }, [isInitialized]),

    notification: useCallback((type: 'error' | 'success' | 'warning') => {
      if (!isInitialized) return;
      
      try {
        hapticFeedback.notificationOccurred(type);
      } catch (error) {
        console.warn('Haptic notification failed:', error);
      }
    }, [isInitialized]),

    selection: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        hapticFeedback.selectionChanged();
      } catch (error) {
        console.warn('Haptic selection failed:', error);
      }
    }, [isInitialized])
  };

  const navigation = {
    setMainButton: useCallback((text: string, onClick: () => void) => {
      if (!isInitialized) return;
      
      try {
        mainButton.setParams({
          text,
          isVisible: true,
          isEnabled: true
        });
        mainButton.onClick(onClick);
      } catch (error) {
        console.warn('Main button setup failed:', error);
      }
    }, [isInitialized]),

    hideMainButton: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        mainButton.hide();
      } catch (error) {
        console.warn('Hide main button failed:', error);
      }
    }, [isInitialized]),

    setBackButton: useCallback((onClick: () => void) => {
      if (!isInitialized) return;
      
      try {
        backButton.show();
        backButton.onClick(onClick);
      } catch (error) {
        console.warn('Back button setup failed:', error);
      }
    }, [isInitialized]),

    hideBackButton: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        backButton.hide();
      } catch (error) {
        console.warn('Hide back button failed:', error);
      }
    }, [isInitialized])
  };

  const ui = {
    expand: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        viewport.expand();
      } catch (error) {
        console.warn('Viewport expand failed:', error);
      }
    }, [isInitialized]),

    setHeaderColor: useCallback((color: string) => {
      if (!isInitialized) return;
      
      try {
        if (window.Telegram?.WebApp?.setHeaderColor) {
          window.Telegram.WebApp.setHeaderColor(color);
        }
      } catch (error) {
        console.warn('Header color setup failed:', error);
      }
    }, [isInitialized]),

    enableClosingConfirmation: useCallback(() => {
      if (!isInitialized) return;
      
      try {
        if (window.Telegram?.WebApp?.enableClosingConfirmation) {
          window.Telegram.WebApp.enableClosingConfirmation();
        }
      } catch (error) {
        console.warn('Closing confirmation failed:', error);
      }
    }, [isInitialized])
  };

  const data = {
    getInitData: useCallback(() => {
      if (!isInitialized) return '';
      
      try {
        return initData() || '';
      } catch (error) {
        console.warn('Get init data failed:', error);
        return '';
      }
    }, [isInitialized]),

    getUserData: useCallback(() => {
      if (!isInitialized) return null;
      
      try {
        return initDataUser() || null;
      } catch (error) {
        console.warn('Get user data failed:', error);
        return null;
      }
    }, [isInitialized])
  };

  return {
    performance,
    haptics,
    navigation,
    ui,
    data
  };
}
