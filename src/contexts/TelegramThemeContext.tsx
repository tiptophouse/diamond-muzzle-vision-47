
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUnifiedTelegramWebApp } from '@/hooks/useUnifiedTelegramWebApp';

interface TelegramThemeContextType {
  isDarkMode: boolean;
  themeParams: any;
  applyTelegramTheme: () => void;
}

const TelegramThemeContext = createContext<TelegramThemeContextType | undefined>(undefined);

export function TelegramThemeProvider({ children }: { children: ReactNode }) {
  const { webApp, isInitialized } = useUnifiedTelegramWebApp();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const applyTelegramTheme = () => {
    if (!webApp?.themeParams) return;

    const root = document.documentElement;
    const theme = webApp.themeParams;
    
    // Apply Telegram theme colors to CSS variables
    if (theme.bg_color) {
      root.style.setProperty('--background', theme.bg_color);
    }
    if (theme.text_color) {
      root.style.setProperty('--foreground', theme.text_color);
    }
    if (theme.hint_color) {
      root.style.setProperty('--muted-foreground', theme.hint_color);
    }
    if (theme.link_color) {
      root.style.setProperty('--primary', theme.link_color);
    }
    if (theme.button_color) {
      root.style.setProperty('--accent', theme.button_color);
    }
    if (theme.secondary_bg_color) {
      root.style.setProperty('--card', theme.secondary_bg_color);
    }

    // Set dark mode based on Telegram's color scheme
    setIsDarkMode(webApp.colorScheme === 'dark');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 Applied Telegram theme:', webApp.colorScheme);
    }
  };

  useEffect(() => {
    if (isInitialized && webApp) {
      applyTelegramTheme();
    }
  }, [isInitialized, webApp]);

  return (
    <TelegramThemeContext.Provider value={{
      isDarkMode,
      themeParams: webApp?.themeParams,
      applyTelegramTheme
    }}>
      {children}
    </TelegramThemeContext.Provider>
  );
}

export function useTelegramTheme() {
  const context = useContext(TelegramThemeContext);
  if (context === undefined) {
    throw new Error('useTelegramTheme must be used within a TelegramThemeProvider');
  }
  return context;
}
