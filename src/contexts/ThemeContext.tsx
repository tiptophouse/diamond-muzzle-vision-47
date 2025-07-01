
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Ensure we're in browser environment before accessing localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('theme');
        return (saved as Theme) || 'light';
      } catch (error) {
        console.warn('Failed to read theme from localStorage:', error);
        return 'light';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.document) {
      try {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        
        if (window.localStorage) {
          localStorage.setItem('theme', theme);
        }
      } catch (error) {
        console.warn('Failed to apply theme:', error);
      }
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
