
import { useEffect, useState, useRef } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerColor: string;
  backgroundColor: string;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text: string }> }) => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => void;
  showScanQrPopup: (params: { text?: string }) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: () => Promise<string>;
  requestWriteAccess: () => Promise<boolean>;
  requestContact: () => Promise<boolean>;
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Track Telegram button handlers to avoid duplicate registrations
  const mainButtonHandlerRef = useRef<(() => void) | null>(null);
  const backButtonHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp as TelegramWebApp;
      
      // Initialize the WebApp
      tg.ready();
      tg.expand();
      
      // Set theme colors for better integration
      tg.setHeaderColor('#ffffff');
      tg.setBackgroundColor('#f8fafc');
      
      // iPhone-specific optimizations
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Handle viewport changes for better responsiveness
      const handleViewportChange = () => {
        // Update CSS custom properties for responsive design
        const viewportHeight = tg.viewportHeight || window.innerHeight;
        const stableHeight = tg.viewportStableHeight || viewportHeight;
        const safeAreaTop = tg.safeAreaInset?.top || 0;
        const safeAreaBottom = tg.safeAreaInset?.bottom || 0;
        
        document.documentElement.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
        document.documentElement.style.setProperty('--tg-stable-height', `${stableHeight}px`);
        document.documentElement.style.setProperty('--tg-safe-area-top', `${safeAreaTop}px`);
        document.documentElement.style.setProperty('--tg-safe-area-bottom', `${safeAreaBottom}px`);
        
        // iPhone-specific fixes
        if (isIOS) {
          // Fix for iPhone's dynamic viewport
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
          
          // Prevent zoom on input focus
          const metaViewport = document.querySelector('meta[name=viewport]');
          if (metaViewport) {
            metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
          }
          
          // Handle safe areas for iPhone
          document.documentElement.style.setProperty('--safe-area-inset-top', `env(safe-area-inset-top, ${safeAreaTop}px)`);
          document.documentElement.style.setProperty('--safe-area-inset-bottom', `env(safe-area-inset-bottom, ${safeAreaBottom}px)`);
          document.documentElement.style.setProperty('--safe-area-inset-left', `env(safe-area-inset-left, 0px)`);
          document.documentElement.style.setProperty('--safe-area-inset-right', `env(safe-area-inset-right, 0px)`);
        }
        
        // Force re-render of components that depend on viewport
        setWebApp({ ...tg });
      };
      
      // Listen for viewport changes
      tg.onEvent('viewportChanged', handleViewportChange);
      
      // Handle window resize for better responsiveness
      const handleResize = () => {
        if (isIOS) {
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        }
        handleViewportChange();
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleViewportChange);
      
      // Set initial viewport
      handleViewportChange();
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setIsReady(true);
      
      // Enable closing confirmation for better UX
      tg.enableClosingConfirmation();
      
      console.log('🚀 Enhanced Telegram WebApp initialized:', {
        version: tg.version,
        platform: tg.platform,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        safeAreaInset: tg.safeAreaInset,
        isIOS,
        user: tg.initDataUnsafe?.user,
        themeParams: tg.themeParams
      });
      
      // Cleanup function
      return () => {
        tg.offEvent('viewportChanged', handleViewportChange);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleViewportChange);
      };
    } else {
      // Fallback for development - set reasonable defaults
      console.log('📱 Running outside Telegram, using mock data');
      
      const mockViewportHeight = window.innerHeight;
      document.documentElement.style.setProperty('--tg-viewport-height', `${mockViewportHeight}px`);
      document.documentElement.style.setProperty('--tg-stable-height', `${mockViewportHeight}px`);
      document.documentElement.style.setProperty('--vh', `${mockViewportHeight * 0.01}px`);
      document.documentElement.style.setProperty('--tg-safe-area-top', '0px');
      document.documentElement.style.setProperty('--tg-safe-area-bottom', '0px');
      
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
        
        // Add haptic feedback
        hapticFeedback.selection();
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
        
        // Add haptic feedback
        hapticFeedback.selection();
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
    hapticFeedback.impact('light');
    webApp?.showAlert(message);
  };

  const showConfirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      hapticFeedback.impact('medium');
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
    if (webApp) {
      try {
        hapticFeedback.impact('light');
        const shareText = url ? `${text}\n${url}` : text;
        webApp.switchInlineQuery(shareText);
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        showAlert('Link copied to clipboard!');
      }
    }
  };

  const openLink = (url: string) => {
    hapticFeedback.impact('light');
    webApp?.openLink(url, { try_instant_view: true });
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
    themeParams: webApp?.themeParams || {},
    platform: webApp?.platform || 'unknown',
    version: webApp?.version || '1.0',
    // iPhone-specific helpers
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    safeAreaInset: webApp?.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 }
  };
}
