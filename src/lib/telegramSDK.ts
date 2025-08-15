
import { 
  initData, 
  miniApp, 
  themeParams, 
  viewport,
  mainButton,
  backButton,
  cloudStorage,
  requestWriteAccess,
  requestContact,
  shareURL,
  openLink,
  openTelegramLink,
  hapticFeedback,
  qrScanner,
  invoice,
  biometricManager
} from '@telegram-apps/sdk';

export class TelegramSDK {
  private static instance: TelegramSDK;
  
  public static getInstance(): TelegramSDK {
    if (!TelegramSDK.instance) {
      TelegramSDK.instance = new TelegramSDK();
    }
    return TelegramSDK.instance;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Telegram SDK...');
      
      if (typeof window === 'undefined') {
        console.log('⚠️ Not in browser environment');
        return false;
      }

      // Initialize components
      initData.restore();
      miniApp.ready();
      
      if (viewport.isSupported()) {
        viewport.bindCssVars();
      }

      console.log('✅ Telegram SDK initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram SDK:', error);
      return false;
    }
  }

  getUserData() {
    try {
      if (!initData.user()) {
        return null;
      }

      const user = initData.user();
      return {
        id: user?.id || 0,
        first_name: user?.firstName || 'User',
        last_name: user?.lastName || '',
        username: user?.username || '',
        language_code: user?.languageCode || 'en',
        is_premium: user?.isPremium || false,
        photo_url: user?.photoUrl || ''
      };
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  getThemeParams() {
    try {
      return {
        bg_color: themeParams.backgroundColor() || '#ffffff',
        text_color: themeParams.textColor() || '#000000',
        hint_color: themeParams.hintColor() || '#707579',
        link_color: themeParams.linkColor() || '#3390ec',
        button_color: themeParams.buttonColor() || '#3390ec',
        button_text_color: themeParams.buttonTextColor() || '#ffffff'
      };
    } catch (error) {
      console.error('❌ Error getting theme params:', error);
      return {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#707579',
        link_color: '#3390ec',
        button_color: '#3390ec',
        button_text_color: '#ffffff'
      };
    }
  }

  setMainButton(text: string, color?: string, textColor?: string) {
    try {
      if (mainButton.isSupported()) {
        mainButton.setText(text);
        if (color) {
          mainButton.setBgColor(color);
        }
        if (textColor) {
          mainButton.setTextColor(textColor);
        }
        mainButton.show();
        mainButton.enable();
      }
    } catch (error) {
      console.error('❌ Error setting main button:', error);
    }
  }

  hideMainButton() {
    try {
      if (mainButton.isSupported()) {
        mainButton.hide();
      }
    } catch (error) {
      console.error('❌ Error hiding main button:', error);
    }
  }

  onMainButtonClick(callback: () => void) {
    try {
      if (mainButton.isSupported()) {
        return mainButton.onClick(callback);
      }
    } catch (error) {
      console.error('❌ Error setting main button click handler:', error);
    }
  }

  showBackButton() {
    try {
      if (backButton.isSupported()) {
        backButton.show();
      }
    } catch (error) {
      console.error('❌ Error showing back button:', error);
    }
  }

  hideBackButton() {
    try {
      if (backButton.isSupported()) {
        backButton.hide();
      }
    } catch (error) {
      console.error('❌ Error hiding back button:', error);
    }
  }

  async setCloudStorage(key: string, value: string) {
    try {
      if (cloudStorage.isSupported()) {
        await cloudStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('❌ Error setting cloud storage:', error);
    }
  }

  async getCloudStorage(key: string): Promise<string | null> {
    try {
      if (cloudStorage.isSupported()) {
        return await cloudStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting cloud storage:', error);
      return null;
    }
  }

  async requestWriteAccess() {
    try {
      if (requestWriteAccess.isSupported()) {
        return await requestWriteAccess();
      }
      return false;
    } catch (error) {
      console.error('❌ Error requesting write access:', error);
      return false;
    }
  }

  async requestContact() {
    try {
      if (requestContact.isSupported()) {
        return await requestContact();
      }
      return null;
    } catch (error) {
      console.error('❌ Error requesting contact:', error);
      return null;
    }
  }

  shareURL(url: string, text?: string) {
    try {
      if (shareURL.isSupported()) {
        shareURL(url, text);
      }
    } catch (error) {
      console.error('❌ Error sharing URL:', error);
    }
  }

  openLink(url: string) {
    try {
      if (openLink.isSupported()) {
        openLink(url);
      }
    } catch (error) {
      console.error('❌ Error opening link:', error);
    }
  }

  openTelegramLink(url: string) {
    try {
      if (openTelegramLink.isSupported()) {
        openTelegramLink(url);
      }
    } catch (error) {
      console.error('❌ Error opening Telegram link:', error);
    }
  }

  // Haptic feedback methods
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.impactOccurred(style);
      }
    } catch (error) {
      console.error('❌ Error with haptic feedback:', error);
    }
  }

  notificationOccurred(type: 'error' | 'success' | 'warning') {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.notificationOccurred(type);
      }
    } catch (error) {
      console.error('❌ Error with notification haptic:', error);
    }
  }

  selectionChanged() {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.selectionChanged();
      }
    } catch (error) {
      console.error('❌ Error with selection haptic:', error);
    }
  }

  isWebAppReady(): boolean {
    return initData.user() !== undefined;
  }
}

export const telegramSDK = TelegramSDK.getInstance();
