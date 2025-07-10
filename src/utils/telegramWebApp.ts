
// Telegram WebApp utility functions for secure authentication
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  themeParams: any;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  colorScheme: 'light' | 'dark';
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  MainButton?: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  close?: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function isTelegramWebAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.Telegram?.WebApp && 
    typeof window.Telegram.WebApp === 'object'
  );
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (!isTelegramWebAppEnvironment()) {
    return null;
  }
  
  return window.Telegram!.WebApp;
}

export function parseTelegramInitData(initData: string) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userParam));
    
    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url
      },
      auth_date: urlParams.get('auth_date'),
      hash: urlParams.get('hash')
    };
  } catch (error) {
    console.error('Failed to parse Telegram initData:', error);
    return null;
  }
}

export function validateTelegramInitData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      return false;
    }
    
    // Check if the data is not too old (within 1 minute)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 60 * 1000; // 1 minute
    
    return (now - authDateTime) <= maxAge;
  } catch (error) {
    console.error('Failed to validate Telegram initData:', error);
    return false;
  }
}

export async function initializeTelegramWebApp(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isTelegramWebAppEnvironment()) {
      // Set fallback viewport height for non-Telegram environments
      setViewportHeight(window.innerHeight);
      resolve(false);
      return;
    }
    
    try {
      const tg = getTelegramWebApp();
      if (tg) {
        // Initialize Telegram WebApp
        if (typeof tg.ready === 'function') {
          tg.ready();
        }
        if (typeof tg.expand === 'function') {
          tg.expand();
        }
        
        // Set initial viewport height
        setViewportHeight(tg.viewportStableHeight || tg.viewportHeight || window.innerHeight);
        
        // Apply Telegram theme
        applyTelegramTheme(tg.themeParams, tg.colorScheme);
        
        // Listen for viewport changes
        if (typeof tg.onEvent === 'function') {
          tg.onEvent('viewportChanged', () => {
            setViewportHeight(tg.viewportStableHeight || tg.viewportHeight || window.innerHeight);
          });
          
          tg.onEvent('themeChanged', () => {
            applyTelegramTheme(tg.themeParams, tg.colorScheme);
          });
        }
        
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      setViewportHeight(window.innerHeight);
      resolve(false);
    }
  });
}

export function setViewportHeight(height: number): void {
  const actualHeight = height || window.innerHeight;
  document.documentElement.style.setProperty('--tg-viewport-height', `${actualHeight}px`);
  console.log(`📱 Viewport height set to: ${actualHeight}px`);
}

export function applyTelegramTheme(themeParams: any, colorScheme: 'light' | 'dark'): void {
  if (!themeParams) return;
  
  try {
    const root = document.documentElement;
    
    // Apply Telegram theme colors as CSS variables
    if (themeParams.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
    }
    if (themeParams.text_color) {
      root.style.setProperty('--tg-theme-text-color', themeParams.text_color);
    }
    if (themeParams.hint_color) {
      root.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
    }
    if (themeParams.link_color) {
      root.style.setProperty('--tg-theme-link-color', themeParams.link_color);
    }
    if (themeParams.button_color) {
      root.style.setProperty('--tg-theme-button-color', themeParams.button_color);
    }
    if (themeParams.button_text_color) {
      root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
    }
    
    // Apply color scheme
    root.setAttribute('data-color-scheme', colorScheme);
    
    console.log(`🎨 Applied Telegram ${colorScheme} theme`);
  } catch (error) {
    console.error('Failed to apply Telegram theme:', error);
  }
}

export function useTelegramMainButton(): {
  setText: (text: string) => void;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  enable: () => void;
  disable: () => void;
} {
  const tg = getTelegramWebApp();
  
  return {
    setText: (text: string) => {
      if (tg?.MainButton?.setText) {
        tg.MainButton.setText(text);
      }
    },
    show: () => {
      if (tg?.MainButton?.show) {
        tg.MainButton.show();
      }
    },
    hide: () => {
      if (tg?.MainButton?.hide) {
        tg.MainButton.hide();
      }
    },
    onClick: (callback: () => void) => {
      if (tg?.MainButton?.onClick) {
        tg.MainButton.onClick(callback);
      }
    },
    enable: () => {
      if (tg?.MainButton?.enable) {
        tg.MainButton.enable();
      }
    },
    disable: () => {
      if (tg?.MainButton?.disable) {
        tg.MainButton.disable();
      }
    }
  };
}
