
import { getTelegramWebApp, initializeTelegramWebApp } from '@/utils/telegramWebApp';

// Initialize Telegram WebApp SDK
export async function initTelegramSDK(): Promise<boolean> {
  try {
    const success = await initializeTelegramWebApp();
    if (!success) return false;

    const tg = getTelegramWebApp();
    if (!tg) return false;

    // Setup theme listener
    setupThemeListener(tg);
    
    return true;
  } catch (error) {
    console.error('Failed to init Telegram SDK:', error);
    return false;
  }
}

// Setup dynamic theme updates
function setupThemeListener(tg: any) {
  const updateThemeVars = () => {
    const root = document.documentElement;
    const theme = tg.themeParams;
    
    if (theme.bg_color) {
      root.style.setProperty('--tg-bg', theme.bg_color);
    }
    if (theme.text_color) {
      root.style.setProperty('--tg-text', theme.text_color);
    }
    if (theme.hint_color) {
      root.style.setProperty('--tg-hint', theme.hint_color);
    }
    if (theme.button_color) {
      root.style.setProperty('--tg-button', theme.button_color);
    }
    if (theme.button_text_color) {
      root.style.setProperty('--tg-button-text', theme.button_text_color);
    }
  };

  // Initial theme setup
  updateThemeVars();

  // Listen for theme changes
  if (typeof tg.onEvent === 'function') {
    tg.onEvent('themeChanged', updateThemeVars);
  }
}

// Get Telegram init data
export function getTelegramInitData(): string | null {
  const tg = getTelegramWebApp();
  return tg?.initData || null;
}

// Main button helpers
export const mainButton = {
  setText: (text: string) => {
    const tg = getTelegramWebApp();
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
    }
  },
  
  show: () => {
    const tg = getTelegramWebApp();
    if (tg?.MainButton) {
      tg.MainButton.show();
    }
  },
  
  hide: () => {
    const tg = getTelegramWebApp();
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  },
  
  onClick: (callback: () => void) => {
    const tg = getTelegramWebApp();
    if (tg?.MainButton) {
      tg.MainButton.onClick(callback);
    }
  }
};

// Back button helpers
export const backButton = {
  show: () => {
    const tg = getTelegramWebApp();
    if (tg?.BackButton) {
      tg.BackButton.show();
    }
  },
  
  hide: () => {
    const tg = getTelegramWebApp();
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  },
  
  onClick: (callback: () => void) => {
    const tg = getTelegramWebApp();
    if (tg?.BackButton) {
      tg.BackButton.onClick(callback);
    }
  }
};
