
// Telegram WebApp utility functions for secure authentication
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  themeParams: any;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  MainButton?: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    setText: (text: string) => void;
    showProgress: () => void;
    hideProgress: () => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
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
      resolve(false);
      return;
    }
    
    try {
      const tg = getTelegramWebApp();
      if (tg) {
        if (typeof tg.ready === 'function') {
          tg.ready();
        }
        if (typeof tg.expand === 'function') {
          tg.expand();
        }
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      resolve(false);
    }
  });
}
