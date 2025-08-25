
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

interface EnhancedTelegramWebApp {
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
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
}

export function useEnhancedTelegramWebApp() {
  const [webApp, setWebApp] = useState<EnhancedTelegramWebApp | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Enhanced initialization with latest SDK features
  const initializeWebApp = useCallback(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      console.log('🚀 Initializing Enhanced Telegram WebApp SDK...');
      
      // Initialize WebApp with latest features
      WebApp.ready();
      WebApp.expand();
      
      // Enable modern features
      WebApp.enableClosingConfirmation();
      
      // Set optimal theme for better UX
      WebApp.setHeaderColor('#1f2937');
      WebApp.setBackgroundColor('#f8fafc');
      
      // iPhone-specific optimizations
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('📱 iOS detected - applying iPhone optimizations');
        
        // Handle safe area for iPhone
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${WebApp.safeAreaInset?.top || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${WebApp.safeAreaInset?.bottom || 0}px`);
        
        // Optimize viewport for iPhone
        document.documentElement.style.setProperty('--tg-viewport-height', `${WebApp.viewportStableHeight || WebApp.viewportHeight}px`);
        
        // Prevent iOS zoom on input focus
        const metaViewport = document.querySelector('meta[name=viewport]');
        if (metaViewport) {
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      } else {
        document.documentElement.style.setProperty('--tg-viewport-height', `${WebApp.viewportHeight}px`);
      }

      // Set up enhanced WebApp state
      const enhancedWebApp: EnhancedTelegramWebApp = {
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
        isClosingConfirmationEnabled: true,
        headerColor: '#1f2937',
        backgroundColor: '#f8fafc'
      };

      setWebApp(enhancedWebApp);
      setIsInitialized(true);

      console.log('✅ Enhanced Telegram WebApp initialized:', {
        version: WebApp.version,
        platform: WebApp.platform,
        user: enhancedWebApp.user?.first_name,
        safeArea: enhancedWebApp.safeAreaInset
      });

    } catch (error) {
      console.error('❌ Enhanced WebApp initialization failed:', error);
      setIsInitialized(true); // Set as initialized even on error
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeWebApp();
    }
  }, [initializeWebApp]);

  // Helper function to ensure color format is valid for Telegram SDK
  const formatColor = (color: string): `#${string}` => {
    if (color.startsWith('#')) {
      return color as `#${string}`;
    }
    return `#${color}` as `#${string}`;
  };

  // Enhanced navigation controls with iPhone fixes and proper color typing
  const navigation = {
    showBackButton: useCallback((onClick?: () => void) => {
      try {
        if (onClick) {
          WebApp.BackButton.onClick(onClick);
        }
        WebApp.BackButton.show();
        console.log('📱 Back button shown');
      } catch (error) {
        console.error('❌ Failed to show back button:', error);
      }
    }, []),

    hideBackButton: useCallback(() => {
      try {
        WebApp.BackButton.hide();
        console.log('📱 Back button hidden');
      } catch (error) {
        console.error('❌ Failed to hide back button:', error);
      }
    }, []),

    showMainButton: useCallback((text: string, onClick?: () => void, color: string = '#007AFF') => {
      try {
        WebApp.MainButton.setText(text);
        // Ensure color is properly formatted as hex with type safety
        const validColor = formatColor(color);
        WebApp.MainButton.color = validColor;
        if (onClick) WebApp.MainButton.onClick(onClick);
        WebApp.MainButton.show();
        console.log('📱 Main button shown:', text);
      } catch (error) {
        console.error('❌ Failed to show main button:', error);
      }
    }, []),

    hideMainButton: useCallback(() => {
      try {
        WebApp.MainButton.hide();
        console.log('📱 Main button hidden');
      } catch (error) {
        console.error('❌ Failed to hide main button:', error);
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
    showAlert: useCallback((message: string) => {
      WebApp.showAlert(message);
    }, []),

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

    close: useCallback(() => {
      WebApp.close();
    }, [])
  };

  return {
    webApp,
    isInitialized,
    navigation,
    haptics,
    utils,
    // Raw WebApp access for advanced usage
    rawWebApp: WebApp
  };
}
