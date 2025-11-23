import { useEffect, useState, useRef } from 'react';
import { init, miniApp, themeParams, viewport, initData, backButton, mainButton, hapticFeedback, popup } from '@telegram-apps/sdk';
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
        // Initialize SDK v3.11
        init();
        
        // Mount core components synchronously to avoid race conditions
        miniApp.mountSync();
        themeParams.mount();
        viewport.mount();
        
        const tg = window.Telegram.WebApp as TelegramWebApp;
        
        // Set theme colors for better integration
        if (tg.setHeaderColor) tg.setHeaderColor('#ffffff');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#f8fafc');
        
        // Handle viewport changes for better responsiveness
        const handleViewportChange = () => {
          // Update CSS custom properties for responsive design
          const vp = viewport.height();
          const stableHeight = viewport.stableHeight();
          
          if (vp) {
            document.documentElement.style.setProperty('--tg-viewport-height', `${vp}px`);
          }
          if (stableHeight) {
            document.documentElement.style.setProperty('--tg-stable-height', `${stableHeight}px`);
          }
          
          // Force re-render of components that depend on viewport
          setWebApp({ ...tg });
        };
        
        // Set initial viewport
        handleViewportChange();
        
        setWebApp(tg);
        setUser(initData.user() || null);
        setIsReady(true);
        
        // Enable closing confirmation for better UX
        if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
        
        console.log('🚀 Telegram WebApp initialized with SDK v3.11:', {
          version: tg.version,
          platform: tg.platform,
          viewportHeight: viewport.height(),
          viewportStableHeight: viewport.stableHeight(),
          user: initData.user(),
          themeParams: tg.themeParams
        });
        
        return () => {
          // Cleanup viewport listeners if needed
        };
      } catch (error) {
        console.error('❌ Failed to initialize Telegram SDK:', error);
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

  const hapticFeedbackWrapper = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      try {
        if (hapticFeedback && typeof hapticFeedback.impactOccurred === 'function') {
          hapticFeedback.impactOccurred(style);
        } else if (webApp?.HapticFeedback?.impactOccurred) {
          webApp.HapticFeedback.impactOccurred(style);
        }
      } catch (e) {
        console.warn('Haptic feedback not available:', e);
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      try {
        if (hapticFeedback && typeof hapticFeedback.notificationOccurred === 'function') {
          hapticFeedback.notificationOccurred(type);
        } else if (webApp?.HapticFeedback?.notificationOccurred) {
          webApp.HapticFeedback.notificationOccurred(type);
        }
      } catch (e) {
        console.warn('Haptic feedback not available:', e);
      }
    },
    selection: () => {
      try {
        if (hapticFeedback && typeof hapticFeedback.selectionChanged === 'function') {
          hapticFeedback.selectionChanged();
        } else if (webApp?.HapticFeedback?.selectionChanged) {
          webApp.HapticFeedback.selectionChanged();
        }
      } catch (e) {
        console.warn('Haptic feedback not available:', e);
      }
    }
  };

  const mainButtonWrapper = {
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

  const backButtonWrapper = {
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
    if (webApp?.showAlert) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      if (webApp?.showConfirm) {
        webApp.showConfirm(message, (confirmed) => resolve(confirmed));
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
    hapticFeedback: hapticFeedbackWrapper,
    mainButton: mainButtonWrapper,
    backButton: backButtonWrapper,
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
    version: webApp?.version || '3.11'
  };
}