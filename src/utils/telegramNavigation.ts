
import { TelegramWebApp } from '@/types/telegram';

export const PAGE_CONFIGS = {
  diamond_detail: {
    headerColor: '#ffffff',
    backgroundColor: '#f8fafc',
    showBackButton: true,
    allowClose: true,
  },
  store: {
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    showBackButton: false,
    allowClose: true,
  },
  inventory: {
    headerColor: '#ffffff',
    backgroundColor: '#f8fafc',
    showBackButton: false,
    allowClose: true,
  },
  upload: {
    headerColor: '#4f46e5',
    backgroundColor: '#ffffff',
    showBackButton: true,
    allowClose: true,
  },
};

export const telegramNavigation = {
  setHeaderColor: (color: string) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      if (webApp.setHeaderColor) {
        const formattedColor = color.startsWith('#') ? color : `#${color}`;
        webApp.setHeaderColor(formattedColor as `#${string}`);
      }
    }
  },

  setBackgroundColor: (color: string) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      if (webApp.setBackgroundColor) {
        const formattedColor = color.startsWith('#') ? color : `#${color}`;
        webApp.setBackgroundColor(formattedColor as `#${string}`);
      }
    }
  },

  showBackButton: (callback?: () => void) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      if (webApp.BackButton) {
        webApp.BackButton.show();
        if (callback) {
          webApp.BackButton.onClick(callback);
        }
      }
    }
  },

  hideBackButton: () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      if (webApp.BackButton) {
        webApp.BackButton.hide();
      }
    }
  },

  configurePage: (pageType: keyof typeof PAGE_CONFIGS) => {
    const config = PAGE_CONFIGS[pageType];
    if (config) {
      telegramNavigation.setHeaderColor(config.headerColor);
      telegramNavigation.setBackgroundColor(config.backgroundColor);
      
      if (config.showBackButton) {
        telegramNavigation.showBackButton();
      } else {
        telegramNavigation.hideBackButton();
      }
    }
  },

  impactFeedback: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  },

  cleanup: () => {
    telegramNavigation.hideBackButton();
  }
};

export default telegramNavigation;
