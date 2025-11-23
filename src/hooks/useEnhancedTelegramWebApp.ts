
import { useEffect, useState, useRef, useCallback } from 'react';

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
    if (!window.Telegram?.WebApp) {
      console.warn('⚠️ Telegram WebApp not available');
      setIsInitialized(true);
      return;
    }
    
    initRef.current = true;

    try {
      console.log('🚀 Initializing Enhanced Telegram WebApp SDK...');
      
      const tg = window.Telegram.WebApp as any;
      
      // Initialize WebApp with latest features
      tg.ready();
      tg.expand();
      
      // Enable modern features for stable experience
      tg.enableClosingConfirmation?.();
      
      // iPhone scrolling fixes - Use ONLY disableVerticalSwipes to prevent app closing
      // This prevents the mini app from closing on vertical swipes while allowing native scrolling
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
        console.log('✅ Disabled vertical swipes to prevent app closing - native scrolling enabled');
      }
      
      // Set optimal theme for better UX
      tg.setHeaderColor?.('#1f2937');
      tg.setBackgroundColor?.('#f8fafc');
      
      // iPhone-specific optimizations
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('📱 iOS detected - applying iPhone optimizations');
        
        // Handle safe area for iPhone
        document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${tg.safeAreaInset?.top || 0}px`);
        document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', `${tg.safeAreaInset?.bottom || 0}px`);
        
        // Optimize viewport for iPhone - Always use viewportStableHeight for iOS
        const stableHeight = tg.viewportStableHeight || tg.viewportHeight;
        document.documentElement.style.setProperty('--tg-viewport-height', `${stableHeight}px`);
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableHeight}px`);
        
        // Prevent iOS zoom on input focus
        const metaViewport = document.querySelector('meta[name=viewport]');
        if (metaViewport) {
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Apply Telegram theme colors
        applyTelegramTheme();
      } else {
        document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
        // Apply Telegram theme colors for non-iOS too
        applyTelegramTheme();
      }

      // Function to apply Telegram's dynamic theme
      function applyTelegramTheme() {
        const theme = tg.themeParams;
        console.log('🎨 Applying Telegram theme:', theme);
        
        if (theme) {
          // Apply Telegram colors to CSS variables
          if (theme.bg_color) {
            document.documentElement.style.setProperty('--background', convertToHSL(theme.bg_color));
          }
          if (theme.text_color) {
            document.documentElement.style.setProperty('--foreground', convertToHSL(theme.text_color));
          }
          if (theme.hint_color) {
            document.documentElement.style.setProperty('--muted-foreground', convertToHSL(theme.hint_color));
          }
          if (theme.link_color) {
            document.documentElement.style.setProperty('--primary', convertToHSL(theme.link_color));
          }
          if (theme.button_color) {
            document.documentElement.style.setProperty('--primary', convertToHSL(theme.button_color));
          }
          if (theme.button_text_color) {
            document.documentElement.style.setProperty('--primary-foreground', convertToHSL(theme.button_text_color));
          }
          if (theme.secondary_bg_color) {
            document.documentElement.style.setProperty('--card', convertToHSL(theme.secondary_bg_color));
            document.documentElement.style.setProperty('--secondary', convertToHSL(theme.secondary_bg_color));
          }
        }
      }

      // Convert hex color to HSL for CSS variables
      function convertToHSL(hex: string): string {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return '0 0% 50%';
        
        const r = parseInt(result[1], 16) / 255;
        const g = parseInt(result[2], 16) / 255;
        const b = parseInt(result[3], 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      }

      // Set up enhanced WebApp state
      const enhancedWebApp: EnhancedTelegramWebApp = {
        user: tg.initDataUnsafe?.user ? {
          id: tg.initDataUnsafe.user.id,
          first_name: tg.initDataUnsafe.user.first_name,
          last_name: tg.initDataUnsafe.user.last_name,
          username: tg.initDataUnsafe.user.username,
          language_code: tg.initDataUnsafe.user.language_code,
          is_premium: tg.initDataUnsafe.user.is_premium,
          photo_url: tg.initDataUnsafe.user.photo_url
        } : null,
        isReady: true,
        isExpanded: tg.isExpanded,
        platform: tg.platform,
        version: tg.version,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        safeAreaInset: {
          top: tg.safeAreaInset?.top || 0,
          bottom: tg.safeAreaInset?.bottom || 0,
          left: tg.safeAreaInset?.left || 0,
          right: tg.safeAreaInset?.right || 0
        },
        isClosingConfirmationEnabled: true,
        headerColor: '#1f2937',
        backgroundColor: '#f8fafc'
      };

      setWebApp(enhancedWebApp);
      setIsInitialized(true);

      console.log('✅ Enhanced Telegram WebApp initialized:', {
        version: tg.version,
        platform: tg.platform,
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
      
      // Listen for viewport changes to update CSS variables dynamically
      const handleViewportChanged = () => {
        if (!window.Telegram?.WebApp) return;
        
        const tg = window.Telegram.WebApp as any;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && webApp) {
          const stableHeight = tg.viewportStableHeight || tg.viewportHeight;
          document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
          document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableHeight}px`);
          console.log('📱 iOS viewport updated:', { viewportHeight: tg.viewportHeight, stableHeight });
        }
      };
      
      // Set up viewport change listener
      const tg = window.Telegram?.WebApp as any;
      if (tg?.onEvent) {
        tg.onEvent('viewportChanged', handleViewportChanged);
        
        return () => {
          tg.offEvent?.('viewportChanged', handleViewportChanged);
        };
      }
    }
  }, [initializeWebApp, webApp]);

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
        const tg = window.Telegram?.WebApp as any;
        if (!tg?.BackButton) return;
        if (onClick) {
          tg.BackButton.onClick(onClick);
        }
        tg.BackButton.show();
        console.log('📱 Back button shown');
      } catch (error) {
        console.error('❌ Failed to show back button:', error);
      }
    }, []),

    hideBackButton: useCallback(() => {
      try {
        const tg = window.Telegram?.WebApp as any;
        if (!tg?.BackButton) return;
        tg.BackButton.hide();
        console.log('📱 Back button hidden');
      } catch (error) {
        console.error('❌ Failed to hide back button:', error);
      }
    }, []),

    showMainButton: useCallback((text: string, onClick?: () => void, color: string = '#007AFF') => {
      try {
        const tg = window.Telegram?.WebApp as any;
        if (!tg?.MainButton) return;
        tg.MainButton.setText(text);
        // Ensure color is properly formatted as hex with type safety
        const validColor = formatColor(color);
        tg.MainButton.color = validColor;
        if (onClick) tg.MainButton.onClick(onClick);
        tg.MainButton.show();
        console.log('📱 Main button shown:', text);
      } catch (error) {
        console.error('❌ Failed to show main button:', error);
      }
    }, []),

    hideMainButton: useCallback(() => {
      try {
        const tg = window.Telegram?.WebApp as any;
        if (!tg?.MainButton) return;
        tg.MainButton.hide();
        console.log('📱 Main button hidden');
      } catch (error) {
        console.error('❌ Failed to hide main button:', error);
      }
    }, [])
  };

  // Enhanced haptic feedback
  const haptics = {
    light: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.impactOccurred('light'), []),
    medium: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.impactOccurred('medium'), []),
    heavy: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.impactOccurred('heavy'), []),
    success: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.notificationOccurred('success'), []),
    error: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.notificationOccurred('error'), []),
    warning: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.notificationOccurred('warning'), []),
    selection: useCallback(() => (window.Telegram?.WebApp as any)?.HapticFeedback?.selectionChanged(), [])
  };

  // Enhanced utilities
  const utils = {
    showAlert: useCallback((message: string) => {
      (window.Telegram?.WebApp as any)?.showAlert?.(message);
    }, []),

    showConfirm: useCallback((message: string, callback?: (confirmed: boolean) => void) => {
      (window.Telegram?.WebApp as any)?.showConfirm?.(message, callback);
    }, []),

    openLink: useCallback((url: string, tryInstantView = true) => {
      (window.Telegram?.WebApp as any)?.openLink?.(url, { try_instant_view: tryInstantView });
    }, []),

    share: useCallback((text: string, url?: string) => {
      const shareText = url ? `${text}\n${url}` : text;
      (window.Telegram?.WebApp as any)?.switchInlineQuery?.(shareText);
    }, []),

    close: useCallback(() => {
      (window.Telegram?.WebApp as any)?.close?.();
    }, [])
  };

  return {
    webApp,
    isInitialized,
    navigation,
    haptics,
    utils,
    // Raw WebApp access for advanced usage
    rawWebApp: window.Telegram?.WebApp
  };
}
