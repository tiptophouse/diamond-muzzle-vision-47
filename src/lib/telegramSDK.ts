
import { 
  initData, 
  viewport, 
  themeParams, 
  mainButton, 
  hapticFeedback,
  retrieveLaunchParams
} from '@telegram-apps/sdk';

export interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: any;
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  themeParams?: any;
  isExpanded?: boolean;
  viewportHeight?: number;
  sendData?: (data: string) => void;
  ready?: () => void;
  expand?: () => void;
  close?: () => void;
  MainButton?: {
    text?: string;
    color?: string;
    textColor?: string;
    isVisible?: boolean;
    isActive?: boolean;
    show?: () => void;
    hide?: () => void;
    enable?: () => void;
    disable?: () => void;
    setText?: (text: string) => void;
    onClick?: (callback: () => void) => void;
    offClick?: (callback: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred?: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred?: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged?: () => void;
  };
}

export const initializeTelegramSDK = async () => {
  try {
    const launchParams = retrieveLaunchParams();
    console.log('📱 Telegram SDK initialized with launch params:', launchParams);

    // Initialize initData if supported
    try {
      initData.restore();
      console.log('✅ InitData restored successfully');
    } catch (error) {
      console.warn('⚠️ InitData not available:', error);
    }

    // Initialize viewport if supported
    try {
      viewport.mount();
      viewport.expand();
      console.log('✅ Viewport initialized and expanded');
    } catch (error) {
      console.warn('⚠️ Viewport not available:', error);
    }

    // Initialize theme params if supported
    try {
      themeParams.mount();
      console.log('✅ Theme params initialized');
    } catch (error) {
      console.warn('⚠️ Theme params not available:', error);
    }

    // Initialize main button if supported
    try {
      mainButton.mount();
      console.log('✅ Main button initialized');
    } catch (error) {
      console.warn('⚠️ Main button not available:', error);
    }

    // Initialize haptic feedback if supported
    try {
      hapticFeedback.mount();
      console.log('✅ Haptic feedback initialized');
    } catch (error) {
      console.warn('⚠️ Haptic feedback not available:', error);
    }

    return {
      initData: initData.state,
      viewport: viewport.state,
      themeParams: themeParams.state,
      mainButton: mainButton.state,
      hapticFeedback
    };
  } catch (error) {
    console.error('❌ Failed to initialize Telegram SDK:', error);
    return null;
  }
};

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const showMainButton = (text: string, onClick: () => void) => {
  try {
    mainButton.setText(text);
    mainButton.show();
    mainButton.enable();
    mainButton.on('click', onClick);
    console.log('✅ Main button shown with text:', text);
  } catch (error) {
    console.warn('⚠️ Could not show main button:', error);
  }
};

export const hideMainButton = () => {
  try {
    mainButton.hide();
    console.log('✅ Main button hidden');
  } catch (error) {
    console.warn('⚠️ Could not hide main button:', error);
  }
};

export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') => {
  try {
    if (type === 'success' || type === 'error' || type === 'warning') {
      hapticFeedback.notificationOccurred(type);
    } else {
      hapticFeedback.impactOccurred(type);
    }
    console.log('✅ Haptic feedback triggered:', type);
  } catch (error) {
    console.warn('⚠️ Could not trigger haptic feedback:', error);
  }
};

export const expandTelegramApp = () => {
  try {
    viewport.expand();
    console.log('✅ Telegram app expanded');
  } catch (error) {
    console.warn('⚠️ Could not expand Telegram app:', error);
  }
};

export const getTelegramInitData = () => {
  try {
    return initData.state;
  } catch (error) {
    console.warn('⚠️ Could not get init data:', error);
    return null;
  }
};

export const getTelegramThemeParams = () => {
  try {
    return themeParams.state;
  } catch (error) {
    console.warn('⚠️ Could not get theme params:', error);
    return null;
  }
};

export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
};

export const sendTelegramData = (data: any) => {
  try {
    const webApp = getTelegramWebApp();
    if (webApp && typeof webApp.sendData === 'function') {
      webApp.sendData(JSON.stringify(data));
      console.log('✅ Data sent to Telegram:', data);
    } else {
      console.warn('⚠️ sendData not available');
    }
  } catch (error) {
    console.error('❌ Failed to send data to Telegram:', error);
  }
};

export const closeTelegramApp = () => {
  try {
    const webApp = getTelegramWebApp();
    if (webApp && typeof webApp.close === 'function') {
      webApp.close();
      console.log('✅ Telegram app closed');
    } else {
      console.warn('⚠️ close not available');
    }
  } catch (error) {
    console.error('❌ Failed to close Telegram app:', error);
  }
};
