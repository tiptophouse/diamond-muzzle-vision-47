import { useState, useEffect, useCallback } from 'react';
import { telegramWebApp } from '@/utils/telegramWebApp';

export function useTelegramNavigation() {
  const [webApp, setWebApp] = useState(telegramWebApp.getWebApp());

  useEffect(() => {
    setWebApp(telegramWebApp.getWebApp());
  }, []);

  const setHeaderColor = useCallback((color: string) => {
    if (!webApp) return;
    
    try {
      // Ensure color starts with # for hex format
      const hexColor = color.startsWith('#') ? color : `#${color}`;
      webApp.setHeaderColor(hexColor);
      console.log('🎨 Header color set to:', hexColor);
    } catch (error) {
      console.error('Failed to set header color:', error);
    }
  }, [webApp]);

  const setBackgroundColor = useCallback((color: string) => {
    if (!webApp) return;

    try {
      // Ensure color starts with # for hex format
      const hexColor = color.startsWith('#') ? color : `#${color}`;
      webApp.setBackgroundColor(hexColor);
      console.log('🎨 Background color set to:', hexColor);
    } catch (error) {
      console.error('Failed to set background color:', error);
    }
  }, [webApp]);

  return {
    setHeaderColor,
    setBackgroundColor,
  };
}
