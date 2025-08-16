
import { useEffect, useState, useRef } from 'react';
import { 
  initData, 
  viewport, 
  themeParams, 
  mainButton, 
  backButton, 
  hapticFeedback,
  init as initSDK
} from '@telegram-apps/sdk';
import { TelegramUser } from '@/types/telegram';

interface ModernTelegramWebApp {
  user: TelegramUser | null;
  isReady: boolean;
  themeParams: any;
  platform: string;
  version: string;
  hapticFeedback: {
    impact: (style?: 'light' | 'medium' | 'heavy') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  mainButton: {
    show: (text: string, onClick: () => void, color?: string) => void;
    hide: () => void;
    setText: (text: string) => void;
    enable: () => void;
    disable: () => void;
  };
  backButton: {
    show: (onClick: () => void) => void;
    hide: () => void;
  };
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  share: (text: string, url?: string) => Promise<void>;
  openLink: (url: string) => void;
}

export function useModernTelegramWebApp(): ModernTelegramWebApp {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [currentThemeParams, setCurrentThemeParams] = useState<any>({});
  
  const mainButtonCallbackRef = useRef<(() => void) | null>(null);
  const backButtonCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        // Initialize the SDK
        initSDK();
        
        // Initialize components
        await Promise.all([
          initData.restore().catch(() => console.log('InitData not available')),
          viewport.restore().catch(() => console.log('Viewport not available')),
          themeParams.restore().catch(() => console.log('ThemeParams not available')),
          mainButton.restore().catch(() => console.log('MainButton not available')),
          backButton.restore().catch(() => console.log('BackButton not available')),
          hapticFeedback.restore().catch(() => console.log('HapticFeedback not available'))
        ]);

        // Set up viewport
        if (viewport.mount.isAvailable()) {
          viewport.mount();
          viewport.expand();
        }

        // Get user data from initData
        if (initData.restore.isAvailable() && initData.user()) {
          const telegramUser = initData.user();
          if (telegramUser) {
            setUser({
              id: telegramUser.id,
              first_name: telegramUser.firstName,
              last_name: telegramUser.lastName,
              username: telegramUser.username,
              language_code: telegramUser.languageCode,
              is_premium: telegramUser.isPremium,
              photo_url: telegramUser.photoUrl
            });
          }
        }

        // Set up theme params
        if (themeParams.mount.isAvailable()) {
          themeParams.mount();
          setCurrentThemeParams(themeParams.getState());
          
          // Listen for theme changes
          const unsubscribe = themeParams.onChange(() => {
            setCurrentThemeParams(themeParams.getState());
          });
          
          // Apply theme to CSS
          const params = themeParams.getState();
          if (params.bgColor) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', params.bgColor);
            document.body.style.backgroundColor = params.bgColor;
          }
          if (params.textColor) {
            document.documentElement.style.setProperty('--tg-theme-text-color', params.textColor);
          }
        }

        // Set up viewport handling
        if (viewport.mount.isAvailable()) {
          const updateViewport = () => {
            const height = viewport.height();
            const stableHeight = viewport.stableHeight();
            
            document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
            document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableHeight}px`);
          };
          
          updateViewport();
          const unsubscribe = viewport.onChange(updateViewport);
        }

        setIsReady(true);
        console.log('🚀 Modern Telegram WebApp initialized successfully');
        
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization failed:', error);
        // Set fallback for development
        setIsReady(true);
        setUser({
          id: 2138564172,
          first_name: "Dev",
          last_name: "User",
          username: "devuser",
          language_code: "en"
        });
      }
    };

    initializeTelegram();
  }, []);

  const modernHapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      if (hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred(type);
      }
    },
    selection: () => {
      if (hapticFeedback.selectionChanged.isAvailable()) {
        hapticFeedback.selectionChanged();
      }
    }
  };

  const modernMainButton = {
    show: (text: string, onClick: () => void, color = '#007AFF') => {
      if (mainButton.mount.isAvailable()) {
        mainButton.mount();
        
        // Remove previous callback
        if (mainButtonCallbackRef.current && mainButton.onClick.isAvailable()) {
          mainButton.offClick(mainButtonCallbackRef.current);
        }
        
        mainButtonCallbackRef.current = onClick;
        mainButton.setParams({ text, bgColor: color, isVisible: true });
        
        if (mainButton.onClick.isAvailable()) {
          mainButton.onClick(onClick);
        }
      }
    },
    hide: () => {
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isVisible: false });
      }
      if (mainButtonCallbackRef.current && mainButton.offClick.isAvailable()) {
        mainButton.offClick(mainButtonCallbackRef.current);
        mainButtonCallbackRef.current = null;
      }
    },
    setText: (text: string) => {
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ text });
      }
    },
    enable: () => {
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isEnabled: true });
      }
    },
    disable: () => {
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isEnabled: false });
      }
    }
  };

  const modernBackButton = {
    show: (onClick: () => void) => {
      if (backButton.mount.isAvailable()) {
        backButton.mount();
        
        // Remove previous callback
        if (backButtonCallbackRef.current && backButton.offClick.isAvailable()) {
          backButton.offClick(backButtonCallbackRef.current);
        }
        
        backButtonCallbackRef.current = onClick;
        backButton.show();
        
        if (backButton.onClick.isAvailable()) {
          backButton.onClick(onClick);
        }
      }
    },
    hide: () => {
      if (backButton.hide.isAvailable()) {
        backButton.hide();
      }
      if (backButtonCallbackRef.current && backButton.offClick.isAvailable()) {
        backButton.offClick(backButtonCallbackRef.current);
        backButtonCallbackRef.current = null;
      }
    }
  };

  const showAlert = (message: string) => {
    // Use native alert as fallback if Telegram method not available
    alert(message);
  };

  const showConfirm = async (message: string): Promise<boolean> => {
    // Use native confirm as fallback if Telegram method not available
    return confirm(message);
  };

  const share = async (text: string, url?: string) => {
    const shareText = url ? `${text}\n${url}` : text;
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        showAlert('Content copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return {
    user,
    isReady,
    themeParams: currentThemeParams,
    platform: 'telegram',
    version: '1.0',
    hapticFeedback: modernHapticFeedback,
    mainButton: modernMainButton,
    backButton: modernBackButton,
    showAlert,
    showConfirm,
    share,
    openLink
  };
}
