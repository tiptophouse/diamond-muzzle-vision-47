
// DEPRECATED: Use NavigationManager and useCentralizedNavigation instead
// This file is kept for backwards compatibility but should not be used in new code

export interface TelegramNavigationOptions {
  enableBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  mainButtonColor?: string;
  onMainButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

// Deprecated - use NavigationManager instead
export class TelegramNavigationManager {
  constructor() {
    console.warn('⚠️ TelegramNavigationManager is deprecated. Use NavigationManager instead.');
  }

  configurePage() {
    console.warn('⚠️ Use useCentralizedNavigation hook instead');
  }

  showBackButton() {
    console.warn('⚠️ Use useCentralizedNavigation hook instead');
  }

  hideBackButton() {
    console.warn('⚠️ Use useCentralizedNavigation hook instead');
  }

  showMainButton() {
    console.warn('⚠️ Use useCentralizedNavigation hook instead');
  }

  hideMainButton() {
    console.warn('⚠️ Use useCentralizedNavigation hook instead');
  }

  impactFeedback() {
    console.warn('⚠️ Use useEnhancedTelegramWebApp haptics instead');
  }

  cleanup() {
    console.warn('⚠️ Use useCentralizedNavigation hook instead');
  }
}

export const telegramNavigation = new TelegramNavigationManager();

export function useTelegramNavigation() {
  console.warn('⚠️ useTelegramNavigation is deprecated. Use useCentralizedNavigation instead.');
  return telegramNavigation;
}

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
