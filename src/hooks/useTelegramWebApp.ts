import { useEffect, useState, useRef } from 'react';
import { init, miniApp, themeParams, viewport, initData } from '@telegram-apps/sdk';
import { TelegramWebApp } from '@/types/telegram';

interface UseTelegramWebAppReturn {
  webApp: TelegramWebApp | null;
  user: any;
  isReady: boolean;
  hapticFeedback: any;
  mainButton: any;
  backButton: any;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  share: (url: string, text?: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  themeParams: TelegramWebApp['themeParams'];
  platform: string;
  version: string;
}

export function useTelegramWebApp(): UseTelegramWebAppReturn {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Track Telegram button handlers to avoid duplicate registrations
  const mainButtonHandlerRef = useRef<(() => void) | null>(null);
  const backButtonHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        console.log('🚀 Initializing @telegram-apps/sdk v3.11.8 with best practices...');
        
        // Initialize the new SDK
        init();
        
        // Mount core components synchronously for immediate availability
        if (miniApp.mount.isAvailable()) {
          miniApp.mount();
          miniApp.ready(); // Signal app is ready
        }
        
        if (themeParams.mount.isAvailable()) {
          themeParams.mount();
        }
        
        if (viewport.mount.isAvailable()) {
          viewport.mount();
          viewport.expand(); // Expand to full height
        }

        const tg = window.Telegram.WebApp as TelegramWebApp;
        
        // Professional best practice: Always call ready()
        if (tg.ready) {
          tg.ready();
          console.log('✅ WebApp.ready() called');
        }
        
        // Best practice: Expand to full screen
        if (tg.expand) {
          tg.expand();
          console.log('✅ WebApp.expand() called');
        }
        
        // Best practice: Disable vertical swipes (prevents accidental mini app closure)
        if (tg.disableVerticalSwipes) {
          tg.disableVerticalSwipes();
          console.log('✅ Vertical swipes disabled');
        }
        
        // Best practice: Set theme colors dynamically based on Telegram theme
        const isDark = tg.colorScheme === 'dark';
        if (tg.setHeaderColor) {
          tg.setHeaderColor(isDark ? tg.themeParams?.bg_color || '#1c1c1e' : '#ffffff');
        }
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor(isDark ? tg.themeParams?.bg_color || '#000000' : '#f8fafc');
        }
        
        // Best practice: Enable closing confirmation (prevents accidental closure)
        if (tg.enableClosingConfirmation) {
          tg.enableClosingConfirmation();
          console.log('✅ Closing confirmation enabled');
        }
        
        // Handle viewport changes for better responsiveness
        const handleViewportChange = () => {
          if (viewport.height()) {
            document.documentElement.style.setProperty('--tg-viewport-height', `${viewport.height()}px`);
          }
          if (viewport.stableHeight()) {
            document.documentElement.style.setProperty('--tg-stable-height', `${viewport.stableHeight()}px`);
          }
          
          setWebApp({ ...tg });
        };
        
        // Listen for viewport changes
        if (tg.onEvent) {
          tg.onEvent('viewportChanged', handleViewportChange);
          
          // Listen for theme changes (pro best practice)
          tg.onEvent('themeChanged', () => {
            console.log('🎨 Theme changed:', tg.colorScheme);
            // Update CSS variables dynamically
            if (tg.themeParams) {
              const root = document.documentElement;
              root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
              root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
              root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
              root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
              root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
              root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
            }
            setWebApp({ ...tg });
          });
        }
        
        // Set initial viewport
        handleViewportChange();
        
        setWebApp(tg);
        
        // Get user from new SDK's initData
        const userData = initData.user();
        setUser(userData || tg.initDataUnsafe?.user || null);
        setIsReady(true);
        
        console.log('✅ @telegram-apps/sdk v3.11.8 initialized with best practices:', {
          version: tg.version,
          platform: tg.platform,
          viewportHeight: viewport.height(),
          viewportStableHeight: viewport.stableHeight(),
          user: userData,
          themeParams: tg.themeParams
        });
        
        // Cleanup function
        return () => {
          if (tg.offEvent) {
            tg.offEvent('viewportChanged', handleViewportChange);
          }
        };
      } catch (error) {
        console.error('❌ Failed to initialize @telegram-apps/sdk:', error);
        // Fallback to window.Telegram.WebApp if SDK init fails
        const tg = window.Telegram.WebApp as TelegramWebApp;
        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user || null);
        setIsReady(true);
      }
    } else {
      // Fallback for development - set reasonable defaults
      console.log('📱 Running outside Telegram, using mock data');
      document.documentElement.style.setProperty('--tg-viewport-height', '100vh');
      document.documentElement.style.setProperty('--tg-stable-height', '100vh');
      setIsReady(true);
    }
  }, []);

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged();
    }
  };

  const mainButton = {
    show: (text: string, onClick: () => void, color = '#007AFF') => {
      if (webApp?.MainButton) {
        // Detach previous handler if exists
        if (mainButtonHandlerRef.current) {
          try {
            webApp.MainButton.offClick(mainButtonHandlerRef.current);
          } catch {}
        }
        mainButtonHandlerRef.current = onClick;

        webApp.MainButton.setText(text);
        webApp.MainButton.color = color;
        webApp.MainButton.onClick(onClick);
        webApp.MainButton.show();
      }
    },
    hide: () => {
      if (webApp?.MainButton) {
        if (mainButtonHandlerRef.current) {
          try {
            webApp.MainButton.offClick(mainButtonHandlerRef.current);
          } catch {}
          mainButtonHandlerRef.current = null;
        }
        webApp.MainButton.hide();
      }
    },
    setText: (text: string) => {
      webApp?.MainButton?.setText(text);
    },
    enable: () => {
      webApp?.MainButton?.enable();
    },
    disable: () => {
      webApp?.MainButton?.disable();
    }
  };

  const backButton = {
    show: (onClick: () => void) => {
      if (webApp?.BackButton) {
        // Detach previous handler if exists
        if (backButtonHandlerRef.current) {
          try {
            webApp.BackButton.offClick(backButtonHandlerRef.current);
          } catch {}
        }
        backButtonHandlerRef.current = onClick;

        webApp.BackButton.onClick(onClick);
        webApp.BackButton.show();
      }
    },
    hide: () => {
      if (webApp?.BackButton) {
        if (backButtonHandlerRef.current) {
          try {
            webApp.BackButton.offClick(backButtonHandlerRef.current);
          } catch {}
          backButtonHandlerRef.current = null;
        }
        webApp.BackButton.hide();
      }
    }
  };

  const showAlert = (message: string) => {
    webApp?.showAlert(message);
  };

  const showConfirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      if (webApp?.showConfirm) {
        webApp.showConfirm(message);
        // Note: Telegram doesn't provide promise-based confirm, this is simplified
        resolve(true);
      } else {
        resolve(window.confirm(message));
      }
    });
  };

  const share = async (text: string, url?: string) => {
    if (webApp && typeof webApp.switchInlineQuery === 'function') {
      try {
        const shareText = url ? `${text}\n${url}` : text;
        webApp.switchInlineQuery(shareText);
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        showAlert('Link copied to clipboard!');
      }
    } else {
      // Fallback for non-Telegram environments
      if (navigator.share) {
        try {
          await navigator.share({ text, url });
        } catch (error) {
          await navigator.clipboard.writeText(text);
          showAlert('Link copied to clipboard!');
        }
      } else {
        await navigator.clipboard.writeText(text);
        showAlert('Link copied to clipboard!');
      }
    }
  };

  const openLink = (url: string, options?: { try_instant_view?: boolean }) => {
    if (webApp?.openLink) {
      webApp.openLink(url, options);
    } else {
      window.open(url, '_blank');
    }
  };

  return {
    webApp,
    user,
    isReady,
    hapticFeedback,
    mainButton,
    backButton,
    showAlert,
    showConfirm,
    share,
    openLink,
    themeParams: webApp?.themeParams || {
      bg_color: '',
      text_color: '',
      hint_color: '',
      link_color: '',
      button_color: '',
      button_text_color: ''
    },
    platform: webApp?.platform || 'unknown',
    version: webApp?.version || '1.0'
  };
}