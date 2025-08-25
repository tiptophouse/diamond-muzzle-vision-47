
import { TelegramWebApp, TelegramUser } from '@/types/telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const telegramWebApp = {
  isAvailable: () => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp;
  },

  getWebApp: () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp;
    }
    return null;
  },

  getUser: (): TelegramUser | null => {
    const webApp = telegramWebApp.getWebApp();
    return webApp?.initDataUnsafe?.user || null;
  },

  getUserId: (): number | null => {
    const user = telegramWebApp.getUser();
    return user?.id || null;
  },

  ready: () => {
    const webApp = telegramWebApp.getWebApp();
    if (webApp) {
      webApp.ready();
    }
  },

  expand: () => {
    const webApp = telegramWebApp.getWebApp();
    if (webApp) {
      webApp.expand();
    }
  },

  close: () => {
    const webApp = telegramWebApp.getWebApp();
    if (webApp) {
      webApp.close();
    }
  },

  setHeaderColor: (color: string) => {
    const webApp = telegramWebApp.getWebApp();
    if (webApp && webApp.setHeaderColor) {
      const formattedColor = color.startsWith('#') ? color : `#${color}`;
      webApp.setHeaderColor(formattedColor as `#${string}`);
    }
  },

  setBackgroundColor: (color: string) => {
    const webApp = telegramWebApp.getWebApp();
    if (webApp && webApp.setBackgroundColor) {
      const formattedColor = color.startsWith('#') ? color : `#${color}`;
      webApp.setBackgroundColor(formattedColor as `#${string}`);
    }
  },

  haptics: {
    light: () => {
      const webApp = telegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.impactOccurred) {
        webApp.HapticFeedback.impactOccurred('light');
      }
    },
    medium: () => {
      const webApp = telegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.impactOccurred) {
        webApp.HapticFeedback.impactOccurred('medium');
      }
    },
    heavy: () => {
      const webApp = telegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.impactOccurred) {
        webApp.HapticFeedback.impactOccurred('heavy');
      }
    },
    success: () => {
      const webApp = telegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.notificationOccurred) {
        webApp.HapticFeedback.notificationOccurred('success');
      }
    },
    error: () => {
      const webApp = telegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.notificationOccurred) {
        webApp.HapticFeedback.notificationOccurred('error');
      }
    },
    warning: () => {
      const webApp = telegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.notificationOccurred) {
        webApp.HapticFeedback.notificationOccurred('warning');
      }
    }
  }
};

// Legacy exports for backward compatibility
export const getTelegramWebApp = telegramWebApp.getWebApp;
export default telegramWebApp;
