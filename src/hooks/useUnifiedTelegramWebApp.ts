
import { useEffect, useState, useRef, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface UnifiedTelegramWebApp {
  user: TelegramUser | null;
  isReady: boolean;
  isExpanded: boolean;
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerColor: string;
  backgroundColor: string;
}

export function useUnifiedTelegramWebApp() {
  const [webApp, setWebApp] = useState<UnifiedTelegramWebApp | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  const initializeWebApp = useCallback(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Initializing Unified Telegram WebApp SDK...');
      }
      
      WebApp.ready();
      WebApp.expand();
      WebApp.enableClosingConfirmation();
      
      // Set optimal theme colors
      WebApp.setHeaderColor('#1f2937');
      WebApp.setBackgroundColor('#f8fafc');
      
      // iOS-specific optimizations
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${WebApp.safeAreaInset?.top || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${WebApp.safeAreaInset?.bottom || 0}px`);
        document.documentElement.style.setProperty('--tg-viewport-height', `${WebApp.viewportStableHeight || WebApp.viewportHeight}px`);
        
        const metaViewport = document.querySelector('meta[name=viewport]');
        if (metaViewport) {
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      } else {
        document.documentElement.style.setProperty('--tg-viewport-height', `${WebApp.viewportHeight}px`);
      }

      const enhancedWebApp: UnifiedTelegramWebApp = {
        user: WebApp.initDataUnsafe?.user ? {
          id: WebApp.initDataUnsafe.user.id,
          first_name: WebApp.initDataUnsafe.user.first_name,
          last_name: WebApp.initDataUnsafe.user.last_name,
          username: WebApp.initDataUnsafe.user.username,
          language_code: WebApp.initDataUnsafe.user.language_code,
          is_premium: WebApp.initDataUnsafe.user.is_premium,
          photo_url: WebApp.initDataUnsafe.user.photo_url
        } : null,
        isReady: true,
        isExpanded: WebApp.isExpanded,
        platform: WebApp.platform,
        version: WebApp.version,
        colorScheme: WebApp.colorScheme,
        themeParams: WebApp.themeParams,
        viewportHeight: WebApp.viewportHeight,
        viewportStableHeight: WebApp.viewportStableHeight,
        safeAreaInset: {
          top: WebApp.safeAreaInset?.top || 0,
          bottom: WebApp.safeAreaInset?.bottom || 0,
          left: WebApp.safeAreaInset?.left || 0,
          right: WebApp.safeAreaInset?.right || 0
        },
        headerColor: '#1f2937',
        backgroundColor: '#f8fafc'
      };

      setWebApp(enhancedWebApp);
      setIsInitialized(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Unified Telegram WebApp initialized:', {
          version: WebApp.version,
          platform: WebApp.platform,
          user: enhancedWebApp.user?.first_name
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ WebApp initialization failed:', error);
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeWebApp();
    }
  }, [initializeWebApp]);

  // Enhanced navigation controls with proper cleanup
  const navigation = {
    showBackButton: useCallback((onClick?: () => void) => {
      try {
        if (onClick) WebApp.BackButton.onClick(onClick);
        WebApp.BackButton.show();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to show back button:', error);
        }
      }
    }, []),

    hideBackButton: useCallback(() => {
      try {
        WebApp.BackButton.hide();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to hide back button:', error);
        }
      }
    }, []),

    showMainButton: useCallback((text: string, onClick?: () => void, color: string = '#007AFF') => {
      try {
        WebApp.MainButton.setText(text);
        WebApp.MainButton.color = color.startsWith('#') ? color as `#${string}` : `#${color}` as `#${string}`;
        if (onClick) WebApp.MainButton.onClick(onClick);
        WebApp.MainButton.show();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to show main button:', error);
        }
      }
    }, []),

    hideMainButton: useCallback(() => {
      try {
        WebApp.MainButton.hide();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to hide main button:', error);
        }
      }
    }, [])
  };

  // Enhanced haptic feedback
  const haptics = {
    light: useCallback(() => WebApp.HapticFeedback?.impactOccurred('light'), []),
    medium: useCallback(() => WebApp.HapticFeedback?.impactOccurred('medium'), []),
    heavy: useCallback(() => WebApp.HapticFeedback?.impactOccurred('heavy'), []),
    success: useCallback(() => WebApp.HapticFeedback?.notificationOccurred('success'), []),
    error: useCallback(() => WebApp.HapticFeedback?.notificationOccurred('error'), []),
    warning: useCallback(() => WebApp.HapticFeedback?.notificationOccurred('warning'), []),
    selection: useCallback(() => WebApp.HapticFeedback?.selectionChanged(), [])
  };

  // Enhanced utilities
  const utils = {
    showAlert: useCallback((message: string) => WebApp.showAlert(message), []),
    showConfirm: useCallback((message: string, callback?: (confirmed: boolean) => void) => {
      WebApp.showConfirm(message, callback);
    }, []),
    openLink: useCallback((url: string, tryInstantView = true) => {
      WebApp.openLink(url, { try_instant_view: tryInstantView });
    }, []),
    share: useCallback((text: string, url?: string) => {
      const shareText = url ? `${text}\n${url}` : text;
      WebApp.switchInlineQuery(shareText);
    }, []),
    close: useCallback(() => WebApp.close(), [])
  };

  return {
    webApp,
    isInitialized,
    navigation,
    haptics,
    utils,
    rawWebApp: WebApp
  };
}
