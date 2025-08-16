
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
        
        // Initialize components with proper error handling
        try {
          initData.restore();
        } catch (e) {
          console.log('InitData not available');
        }

        try {
          viewport.mount();
          viewport.expand();
        } catch (e) {
          console.log('Viewport not available');
        }

        try {
          themeParams.mount();
        } catch (e) {
          console.log('ThemeParams not available');
        }

        try {
          mainButton.mount();
        } catch (e) {
          console.log('MainButton not available');
        }

        try {
          backButton.mount();
        } catch (e) {
          console.log('BackButton not available');
        }

        try {
          hapticFeedback.mount();
        } catch (e) {
          console.log('HapticFeedback not available');
        }

        // Get user data from initData
        try {
          const telegramUser = initData.user();
          if (telegramUser) {
            setUser({
              id: telegramUser.id,
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              username: telegramUser.username,
              language_code: telegramUser.language_code,
              is_premium: telegramUser.is_premium,
              photo_url: telegramUser.photo_url
            });
          }
        } catch (e) {
          console.log('User data not available');
        }

        // Set up theme params
        try {
          const params = themeParams.state();
          setCurrentThemeParams(params);
          
          // Apply theme to CSS
          if (params.bgColor) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', params.bgColor);
            document.body.style.backgroundColor = params.bgColor;
          }
          if (params.textColor) {
            document.documentElement.style.setProperty('--tg-theme-text-color', params.textColor);
          }
        } catch (e) {
          console.log('Theme params not available');
        }

        // Set up viewport handling
        try {
          const updateViewport = () => {
            const height = viewport.height();
            const stableHeight = viewport.stableHeight();
            
            document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
            document.documentElement.style.setProperty('--tg-viewport-stable-height', `${stableHeight}px`);
          };
          
          updateViewport();
        } catch (e) {
          console.log('Viewport handling not available');
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
      try {
        hapticFeedback.impactOccurred(style);
      } catch (e) {
        console.log('Haptic feedback not available');
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      try {
        hapticFeedback.notificationOccurred(type);
      } catch (e) {
        console.log('Haptic notification not available');
      }
    },
    selection: () => {
      try {
        hapticFeedback.selectionChanged();
      } catch (e) {
        console.log('Haptic selection not available');
      }
    }
  };

  const modernMainButton = {
    show: (text: string, onClick: () => void, color = '#007AFF') => {
      try {
        // Remove previous callback
        if (mainButtonCallbackRef.current) {
          mainButton.offClick(mainButtonCallbackRef.current);
        }
        
        mainButtonCallbackRef.current = onClick;
        mainButton.setParams({ text, isVisible: true });
        mainButton.onClick(onClick);
      } catch (e) {
        console.log('Main button not available');
      }
    },
    hide: () => {
      try {
        mainButton.setParams({ isVisible: false });
        if (mainButtonCallbackRef.current) {
          mainButton.offClick(mainButtonCallbackRef.current);
          mainButtonCallbackRef.current = null;
        }
      } catch (e) {
        console.log('Main button not available');
      }
    },
    setText: (text: string) => {
      try {
        mainButton.setParams({ text });
      } catch (e) {
        console.log('Main button not available');
      }
    },
    enable: () => {
      try {
        mainButton.setParams({ isEnabled: true });
      } catch (e) {
        console.log('Main button not available');
      }
    },
    disable: () => {
      try {
        mainButton.setParams({ isEnabled: false });
      } catch (e) {
        console.log('Main button not available');
      }
    }
  };

  const modernBackButton = {
    show: (onClick: () => void) => {
      try {
        // Remove previous callback
        if (backButtonCallbackRef.current) {
          backButton.offClick(backButtonCallbackRef.current);
        }
        
        backButtonCallbackRef.current = onClick;
        backButton.show();
        backButton.onClick(onClick);
      } catch (e) {
        console.log('Back button not available');
      }
    },
    hide: () => {
      try {
        backButton.hide();
        if (backButtonCallbackRef.current) {
          backButton.offClick(backButtonCallbackRef.current);
          backButtonCallbackRef.current = null;
        }
      } catch (e) {
        console.log('Back button not available');
      }
    }
  };

  const showAlert = (message: string) => {
    alert(message);
  };

  const showConfirm = async (message: string): Promise<boolean> => {
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
