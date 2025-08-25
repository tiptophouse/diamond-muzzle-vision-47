
import { useState, useEffect } from 'react';
import { TelegramWebApp, TelegramUser } from '@/types/telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      setWebApp(app);
      setUser(app.initDataUnsafe?.user || null);
      
      app.ready();
      setIsReady(true);
    }
  }, []);

  const setHeaderColor = (color: string) => {
    if (webApp && webApp.setHeaderColor) {
      let formattedColor = color;
      if (!color.startsWith('#')) {
        formattedColor = `#${color}`;
      }
      webApp.setHeaderColor(formattedColor as `#${string}`);
    }
  };

  const setBackgroundColor = (color: string) => {
    if (webApp && webApp.setBackgroundColor) {
      let formattedColor = color;
      if (!color.startsWith('#')) {
        formattedColor = `#${color}`;
      }
      webApp.setBackgroundColor(formattedColor as `#${string}`);
    }
  };

  return {
    webApp,
    user,
    isReady,
    hapticFeedback: {
      light: () => webApp?.HapticFeedback?.impactOccurred?.('light'),
      medium: () => webApp?.HapticFeedback?.impactOccurred?.('medium'),
      heavy: () => webApp?.HapticFeedback?.impactOccurred?.('heavy'),
      success: () => webApp?.HapticFeedback?.notificationOccurred?.('success'),
      error: () => webApp?.HapticFeedback?.notificationOccurred?.('error'),
      warning: () => webApp?.HapticFeedback?.notificationOccurred?.('warning'),
      impact: () => webApp?.HapticFeedback?.impactOccurred?.('medium'),
      notification: () => webApp?.HapticFeedback?.notificationOccurred?.('success'),
    },
    mainButton: {
      text: webApp?.MainButton?.text || '',
      color: webApp?.MainButton?.color || '',
      textColor: webApp?.MainButton?.textColor || '',
      isVisible: webApp?.MainButton?.isVisible || false,
      isActive: webApp?.MainButton?.isActive || false,
      isProgressVisible: webApp?.MainButton?.isProgressVisible || false,
      setText: (text: string) => webApp?.MainButton?.setText?.(text),
      onClick: (callback: () => void) => webApp?.MainButton?.onClick?.(callback),
      show: () => webApp?.MainButton?.show?.(),
      hide: () => webApp?.MainButton?.hide?.(),
      enable: () => webApp?.MainButton?.enable?.(),
      disable: () => webApp?.MainButton?.disable?.(),
      showProgress: () => webApp?.MainButton?.showProgress?.(),
      hideProgress: () => webApp?.MainButton?.hideProgress?.(),
    },
    backButton: {
      isVisible: webApp?.BackButton?.isVisible || false,
      onClick: (callback: () => void) => webApp?.BackButton?.onClick?.(callback),
      show: () => webApp?.BackButton?.show?.(),
      hide: () => webApp?.BackButton?.hide?.(),
    },
    setHeaderColor,
    setBackgroundColor,
  };
}
