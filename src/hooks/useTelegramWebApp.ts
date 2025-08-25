
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<typeof WebApp | null>(null);

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
      setWebApp(WebApp);
    }
  }, []);

  const hapticFeedback = {
    light: () => WebApp.HapticFeedback?.impactOccurred('light'),
    medium: () => WebApp.HapticFeedback?.impactOccurred('medium'),
    heavy: () => WebApp.HapticFeedback?.impactOccurred('heavy'),
    success: () => WebApp.HapticFeedback?.notificationOccurred('success'),
    error: () => WebApp.HapticFeedback?.notificationOccurred('error'),
    warning: () => WebApp.HapticFeedback?.notificationOccurred('warning'),
    selection: () => WebApp.HapticFeedback?.selectionChanged(),
    // Simplified aliases to match expected signatures
    impact: () => WebApp.HapticFeedback?.impactOccurred('medium'),
    notification: () => WebApp.HapticFeedback?.notificationOccurred('success'),
  };

  const mainButton = {
    show: () => WebApp.MainButton?.show(),
    hide: () => WebApp.MainButton?.hide(),
    setText: (text: string) => WebApp.MainButton?.setText(text),
    onClick: (callback: () => void) => WebApp.MainButton?.onClick(callback),
    setColor: (color: string) => {
      if (WebApp.MainButton && color.startsWith('#')) {
        WebApp.MainButton.color = color;
      }
    },
  };

  const backButton = {
    show: () => WebApp.BackButton?.show(),
    hide: () => WebApp.BackButton?.hide(),
    onClick: (callback: () => void) => WebApp.BackButton?.onClick(callback),
  };

  // Add user access from WebApp
  const user = WebApp.initDataUnsafe?.user;

  return { 
    webApp, 
    hapticFeedback,
    mainButton,
    backButton,
    user
  };
}
