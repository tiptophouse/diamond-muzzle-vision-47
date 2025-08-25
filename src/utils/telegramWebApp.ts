
import WebApp from '@twa-dev/sdk';

export const telegramWebApp = {
  init: () => {
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
    }
  },
  
  isInitialized: () => Boolean(WebApp),
  
  getWebApp: () => WebApp,
  
  haptics: {
    light: () => WebApp.HapticFeedback?.impactOccurred('light'),
    medium: () => WebApp.HapticFeedback?.impactOccurred('medium'),
    heavy: () => WebApp.HapticFeedback?.impactOccurred('heavy'),
    success: () => WebApp.HapticFeedback?.notificationOccurred('success'),
    error: () => WebApp.HapticFeedback?.notificationOccurred('error'),
    warning: () => WebApp.HapticFeedback?.notificationOccurred('warning'),
    selection: () => WebApp.HapticFeedback?.selectionChanged(),
  },
  
  mainButton: {
    show: () => WebApp.MainButton?.show(),
    hide: () => WebApp.MainButton?.hide(),
    setText: (text: string) => WebApp.MainButton?.setText(text),
    onClick: (callback: () => void) => WebApp.MainButton?.onClick(callback),
    setColor: (color: string) => {
      if (WebApp.MainButton && color.startsWith('#')) {
        WebApp.MainButton.color = color;
      }
    },
  },
  
  backButton: {
    show: () => WebApp.BackButton?.show(),
    hide: () => WebApp.BackButton?.hide(),
    onClick: (callback: () => void) => WebApp.BackButton?.onClick(callback),
  },
  
  getUser: () => WebApp.initDataUnsafe?.user,
  getUserId: () => WebApp.initDataUnsafe?.user?.id,
};

// Export alias for compatibility
export const getTelegramWebApp = () => telegramWebApp;
