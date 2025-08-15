
import { getTelegramWebApp, initializeTelegramWebApp } from '@/utils/telegramWebApp';

// Enhanced Telegram WebApp interface matching latest SDK
interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
}

interface EnhancedTelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  themeParams: any;
  MainButton: TelegramMainButton;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  close?: () => void;
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
}

// Initialize Telegram WebApp SDK with security validation
export async function initTelegramSDK(): Promise<boolean> {
  try {
    const success = await initializeTelegramWebApp();
    if (!success) return false;

    const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
    if (!tg) return false;

    // Validate SDK integrity
    if (!tg.initData || typeof tg.ready !== 'function') {
      console.warn('⚠️ Telegram SDK integrity check failed');
      return false;
    }

    // Setup secure theme listener with validation
    setupSecureThemeListener(tg);
    
    return true;
  } catch (error) {
    console.error('Failed to init Telegram SDK:', error);
    return false;
  }
}

// Secure theme setup with input validation
function setupSecureThemeListener(tg: EnhancedTelegramWebApp) {
  const updateThemeVars = () => {
    try {
      const root = document.documentElement;
      const theme = tg.themeParams;
      
      // Validate and sanitize theme colors
      if (theme?.bg_color && isValidHexColor(theme.bg_color)) {
        root.style.setProperty('--tg-bg', theme.bg_color);
      }
      if (theme?.text_color && isValidHexColor(theme.text_color)) {
        root.style.setProperty('--tg-text', theme.text_color);
      }
      if (theme?.hint_color && isValidHexColor(theme.hint_color)) {
        root.style.setProperty('--tg-hint', theme.hint_color);
      }
      if (theme?.button_color && isValidHexColor(theme.button_color)) {
        root.style.setProperty('--tg-button', theme.button_color);
      }
      if (theme?.button_text_color && isValidHexColor(theme.button_text_color)) {
        root.style.setProperty('--tg-button-text', theme.button_text_color);
      }
    } catch (error) {
      console.error('Theme update failed:', error);
    }
  };

  // Initial theme setup
  updateThemeVars();

  // Listen for theme changes with error handling
  if (typeof tg.onEvent === 'function') {
    tg.onEvent('themeChanged', updateThemeVars);
  }
}

// Security: Validate hex color format
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Get Telegram init data with validation
export function getTelegramInitData(): string | null {
  try {
    const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
    if (!tg?.initData) return null;
    
    // Basic validation of initData format
    if (typeof tg.initData !== 'string' || tg.initData.length < 10) {
      console.warn('⚠️ Invalid initData format');
      return null;
    }
    
    return tg.initData;
  } catch (error) {
    console.error('Failed to get init data:', error);
    return null;
  }
}

// Secure main button helpers with error handling
export const mainButton = {
  setText: (text: string) => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.MainButton && typeof tg.MainButton.setText === 'function') {
        // Sanitize text input
        const sanitizedText = text.slice(0, 100); // Limit length
        tg.MainButton.setText(sanitizedText);
      }
    } catch (error) {
      console.error('MainButton setText failed:', error);
    }
  },
  
  show: () => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.MainButton && typeof tg.MainButton.show === 'function') {
        tg.MainButton.show();
      }
    } catch (error) {
      console.error('MainButton show failed:', error);
    }
  },
  
  hide: () => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.MainButton && typeof tg.MainButton.hide === 'function') {
        tg.MainButton.hide();
      }
    } catch (error) {
      console.error('MainButton hide failed:', error);
    }
  },
  
  onClick: (callback: () => void) => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.MainButton && typeof tg.MainButton.onClick === 'function') {
        tg.MainButton.onClick(callback);
      }
    } catch (error) {
      console.error('MainButton onClick failed:', error);
    }
  }
};

// Secure back button helpers
export const backButton = {
  show: () => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.BackButton && typeof tg.BackButton.show === 'function') {
        tg.BackButton.show();
      }
    } catch (error) {
      console.error('BackButton show failed:', error);
    }
  },
  
  hide: () => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.BackButton && typeof tg.BackButton.hide === 'function') {
        tg.BackButton.hide();
      }
    } catch (error) {
      console.error('BackButton hide failed:', error);
    }
  },
  
  onClick: (callback: () => void) => {
    try {
      const tg = getTelegramWebApp() as EnhancedTelegramWebApp;
      if (tg?.BackButton && typeof tg.BackButton.onClick === 'function') {
        tg.BackButton.onClick(callback);
      }
    } catch (error) {
      console.error('BackButton onClick failed:', error);
    }
  }
};
