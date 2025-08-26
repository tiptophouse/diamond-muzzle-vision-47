
// DEPRECATED: This file is being phased out in favor of NavigationManager
// Use useCentralizedNavigation hook instead

import WebApp from '@twa-dev/sdk';

// Legacy interface for backward compatibility
interface PageConfig {
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainButtonClick?: () => void;
}

class TelegramNavigation {
  private static instance: TelegramNavigation;
  
  private constructor() {
    console.warn('⚠️ TelegramNavigation is deprecated. Use NavigationManager instead.');
  }

  static getInstance(): TelegramNavigation {
    if (!TelegramNavigation.instance) {
      TelegramNavigation.instance = new TelegramNavigation();
    }
    return TelegramNavigation.instance;
  }

  // Legacy method - now takes no arguments for backward compatibility
  impactFeedback(): void {
    try {
      if (WebApp.HapticFeedback && WebApp.HapticFeedback.impactOccurred) {
        WebApp.HapticFeedback.impactOccurred('medium');
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  // Legacy method - now takes no arguments for backward compatibility  
  cleanup(): void {
    try {
      WebApp.BackButton.hide();
      WebApp.MainButton.hide();
    } catch (error) {
      console.warn('Telegram navigation cleanup warning:', error);
    }
  }

  // Legacy method for backward compatibility
  configurePage(config: PageConfig): void {
    console.warn('⚠️ configurePage is deprecated. Use NavigationManager instead.');
    try {
      if (config.showBackButton && config.onBackButtonClick) {
        WebApp.BackButton.onClick(config.onBackButtonClick);
        WebApp.BackButton.show();
      }

      if (config.showMainButton && config.mainButtonText) {
        WebApp.MainButton.setText(config.mainButtonText);
        if (config.mainButtonColor) {
          WebApp.MainButton.color = config.mainButtonColor as `#${string}`;
        }
        if (config.onMainButtonClick) {
          WebApp.MainButton.onClick(config.onMainButtonClick);
        }
        WebApp.MainButton.show();
      }
    } catch (error) {
      console.error('Page configuration failed:', error);
    }
  }
}

// Legacy constants for backward compatibility
export const PAGE_CONFIGS = {
  DIAMOND_DETAIL: {
    showBackButton: true,
  }
};

export const telegramNavigation = TelegramNavigation.getInstance();
