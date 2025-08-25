
import { TelegramWebApp } from '@/types/telegram';

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
  }
};

export default telegramNavigation;
