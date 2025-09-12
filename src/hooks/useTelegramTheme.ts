import { useEffect, useState } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export function useTelegramTheme() {
  const { webApp, isReady } = useTelegramWebApp();
  const [themeParams, setThemeParams] = useState<TelegramThemeParams>({});

  useEffect(() => {
    if (!isReady || !webApp) return;

    const updateTheme = () => {
      const params = webApp.themeParams || {};
      setThemeParams(params);

      // Apply CSS variables with fallbacks
      const root = document.documentElement;
      root.style.setProperty('--tg-bg', params.bg_color || '#F7F8FA');
      root.style.setProperty('--tg-text', params.text_color || '#0F172A');
      root.style.setProperty('--tg-hint', params.hint_color || '#64748B');
      root.style.setProperty('--tg-link', params.link_color || '#2563EB');
      root.style.setProperty('--tg-btn', params.button_color || '#2563EB');
      root.style.setProperty('--tg-btn-text', params.button_text_color || '#FFFFFF');
      root.style.setProperty('--tg-secondary-bg', params.secondary_bg_color || '#FFFFFF');
    };

    // Initial theme setup
    updateTheme();

    // Listen for theme changes
    const handleThemeChange = () => {
      updateTheme();
    };

    webApp.onEvent('themeChanged', handleThemeChange);

    return () => {
      webApp.offEvent('themeChanged', handleThemeChange);
    };
  }, [isReady, webApp]);

  return {
    themeParams,
    isReady
  };
}