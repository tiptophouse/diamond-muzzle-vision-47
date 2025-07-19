
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // Check Telegram WebApp theme first
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp && typeof webApp.colorScheme === 'string') {
        const tgColorScheme = webApp.colorScheme;
        if (tgColorScheme === 'light' || tgColorScheme === 'dark') {
          return tgColorScheme;
        }
      }
      // Fallback to localStorage
      const saved = localStorage.getItem('theme');
      return (saved as Theme) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Apply Telegram theme colors if available
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp?.themeParams) {
      const params = webApp.themeParams;
      
      // Convert hex colors to HSL for CSS variables
      const hexToHsl = (hex: string) => {
        if (!hex || !hex.startsWith('#')) return '';
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };

      if (params.bg_color) {
        root.style.setProperty('--background', hexToHsl(params.bg_color));
      }
      if (params.text_color) {
        root.style.setProperty('--foreground', hexToHsl(params.text_color));
      }
      if (params.button_color) {
        root.style.setProperty('--primary', hexToHsl(params.button_color));
      }
      if (params.button_text_color) {
        root.style.setProperty('--primary-foreground', hexToHsl(params.button_text_color));
      }
    }
  }, [theme]);

  useEffect(() => {
    // Listen for Telegram theme changes
    const handleThemeChange = () => {
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp && typeof webApp.colorScheme === 'string') {
        const tgTheme = webApp.colorScheme;
        if ((tgTheme === 'light' || tgTheme === 'dark') && tgTheme !== theme) {
          setTheme(tgTheme);
        }
      }
    };

    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && typeof webApp.onEvent === 'function') {
      webApp.onEvent('themeChanged', handleThemeChange);
      return () => {
        if (typeof webApp.offEvent === 'function') {
          webApp.offEvent('themeChanged', handleThemeChange);
        }
      };
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
