
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
    // Add aliases for common usage patterns
    impact: (style: 'light' | 'medium' | 'heavy') => WebApp.HapticFeedback?.impactOccurred(style),
    notification: (type: 'error' | 'success' | 'warning') => WebApp.HapticFeedback?.notificationOccurred(type),
  };

  const mainButton = {
    show: () => WebApp.MainButton?.show(),
    hide: () => WebApp.MainButton?.hide(),
    setText: (text: string) => WebApp.MainButton?.setText(text),
    onClick: (callback: () => void) => WebApp.MainButton?.onClick(callback),
    setColor: (color: string) => {
      if (WebApp.MainButton) {
        WebApp.MainButton.color = color;
      }
    },
  };

  const backButton = {
    show: () => WebApp.BackButton?.show(),
    hide: () => WebApp.BackButton?.hide(),
    onClick: (callback: () => void) => WebApp.BackButton?.onClick(callback),
  };

  return { 
    webApp, 
    hapticFeedback,
    mainButton,
    backButton 
  };
}
