// Telegram WebApp Navigation utilities
export interface TelegramNavigationOptions {
  enableBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

export class TelegramNavigationManager {
  private tg: any = null;
  private backButtonCallback: (() => void) | null = null;
  private mainButtonCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
    }
  }

  // Configure navigation for a specific page
  configurePage(options: TelegramNavigationOptions) {
    if (!this.tg) return;

    // Configure back button
    if (options.enableBackButton) {
      this.showBackButton(options.onBackButtonClick);
    } else {
      this.hideBackButton();
    }

    // Configure main button
    if (options.showMainButton && options.mainButtonText) {
      this.showMainButton({
        text: options.mainButtonText,
        color: options.mainButtonColor || '#2481cc',
        onClick: options.onMainButtonClick
      });
    } else {
      this.hideMainButton();
    }
  }

  // Back button methods
  showBackButton(callback?: () => void) {
    if (!this.tg?.BackButton) return;

    if (callback) {
      this.backButtonCallback = callback;
      this.tg.BackButton.onClick(this.backButtonCallback);
    }
    
    this.tg.BackButton.show();
  }

  hideBackButton() {
    if (!this.tg?.BackButton) return;
    
    if (this.backButtonCallback) {
      // Clear existing callback
      this.backButtonCallback = null;
    }
    
    this.tg.BackButton.hide();
  }

  // Main button methods
  showMainButton(options: {
    text: string;
    color?: string;
    onClick?: () => void;
  }) {
    if (!this.tg?.MainButton) return;

    this.tg.MainButton.setText(options.text);
    
    if (options.color) {
      this.tg.MainButton.color = options.color;
    }

    if (options.onClick) {
      this.mainButtonCallback = options.onClick;
      this.tg.MainButton.onClick(this.mainButtonCallback);
    }

    this.tg.MainButton.show();
  }

  hideMainButton() {
    if (!this.tg?.MainButton) return;
    
    if (this.mainButtonCallback) {
      // Clear existing callback
      this.mainButtonCallback = null;
    }
    
    this.tg.MainButton.hide();
  }

  // Haptic feedback
  impactFeedback(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (this.tg?.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred(style);
    }
  }

  selectionFeedback() {
    if (this.tg?.HapticFeedback) {
      this.tg.HapticFeedback.selectionChanged();
    }
  }

  notificationFeedback(type: 'error' | 'success' | 'warning' = 'success') {
    if (this.tg?.HapticFeedback) {
      this.tg.HapticFeedback.notificationOccurred(type);
    }
  }

  // Cleanup
  cleanup() {
    this.hideBackButton();
    this.hideMainButton();
  }
}

// Create singleton instance
export const telegramNavigation = new TelegramNavigationManager();

// Hook for easy React integration
export function useTelegramNavigation() {
  return telegramNavigation;
}

// Predefined page configurations
export const PAGE_CONFIGS = {
  DIAMOND_DETAIL: {
    enableBackButton: true,
    showMainButton: false
  },
  INVENTORY: {
    enableBackButton: false,
    showMainButton: true,
    mainButtonText: 'Add Diamond',
    mainButtonColor: '#059669'
  },
  STORE: {
    enableBackButton: false,
    showMainButton: false
  },
  UPLOAD: {
    enableBackButton: true,
    showMainButton: true,
    mainButtonText: 'Save Diamond',
    mainButtonColor: '#3b82f6'
  },
  CHAT: {
    enableBackButton: false,
    showMainButton: false
  },
  SETTINGS: {
    enableBackButton: true,
    showMainButton: false
  }
} as const;