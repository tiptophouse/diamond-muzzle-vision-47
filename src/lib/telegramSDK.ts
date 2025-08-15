
import { 
  initData, 
  viewport, 
  themeParams, 
  mainButton,
  utils,
  hapticFeedback,
  qrScanner,
  cloudStorage
} from '@telegram-apps/sdk';

// Initialize Telegram WebApp SDK
let isInitialized = false;
let webApp: any = null;
let user: any = null;
let initDataRaw = '';
let platform = 'unknown';

export const telegramSDK = {
  // Core initialization
  async init() {
    try {
      if (typeof window === 'undefined') return false;
      
      // Initialize init data
      if (initData.isSupported()) {
        initData.restore();
        const data = initData.state();
        if (data) {
          initDataRaw = data.raw;
          user = data.user;
        }
      }

      // Initialize viewport
      if (viewport.isSupported()) {
        viewport.mount();
        viewport.expand();
      }

      // Initialize theme
      if (themeParams.isSupported()) {
        themeParams.mount();
      }

      // Initialize main button
      if (mainButton.isSupported()) {
        mainButton.mount();
      }

      // Initialize haptic feedback
      if (hapticFeedback.isSupported()) {
        hapticFeedback.mount();
      }

      isInitialized = true;
      
      // Get user data
      if (user) {
        console.log('📱 Telegram user authenticated:', {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Telegram SDK initialization failed:', error);
      return false;
    }
  },

  // User data
  getUser() {
    return user ? {
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      language_code: user.language_code || 'en',
      is_premium: user.is_premium || false,
      photo_url: user.photo_url || ''
    } : null;
  },

  // Main button controls
  showMainButton(text: string, onClick?: () => void) {
    if (!mainButton.isSupported()) return;
    
    try {
      mainButton.setParams({
        text,
        is_visible: true,
        is_active: true,
        color: '#007AFF',
        text_color: '#FFFFFF'
      });
      
      if (onClick) {
        mainButton.onClick(onClick);
      }
    } catch (error) {
      console.error('❌ Error showing main button:', error);
    }
  },

  hideMainButton() {
    if (!mainButton.isSupported()) return;
    
    try {
      mainButton.setParams({ is_visible: false });
    } catch (error) {
      console.error('❌ Error hiding main button:', error);
    }
  },

  // Haptic feedback
  impactFeedback(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!hapticFeedback.isSupported()) return;
    
    try {
      hapticFeedback.impactOccurred(style);
    } catch (error) {
      console.error('❌ Error with haptic feedback:', error);
    }
  },

  // Utilities
  openTelegramLink(url: string) {
    if (!utils.isSupported()) return false;
    
    try {
      utils.openTelegramLink(url);
      return true;
    } catch (error) {
      console.error('❌ Error opening Telegram link:', error);
      return false;
    }
  },

  openLink(url: string) {
    if (!utils.isSupported()) return false;
    
    try {
      utils.openLink(url);
      return true;
    } catch (error) {
      console.error('❌ Error opening link:', error);
      return false;
    }
  },

  readTextFromClipboard() {
    if (!utils.isSupported()) return Promise.resolve('');
    
    try {
      return utils.readTextFromClipboard();
    } catch (error) {
      console.error('❌ Error reading clipboard:', error);
      return Promise.resolve('');
    }
  },

  // QR Scanner
  async scanQR() {
    if (!qrScanner.isSupported()) return false;
    
    try {
      const result = await qrScanner.open();
      return result;
    } catch (error) {
      console.error('❌ Error scanning QR:', error);
      return false;
    }
  },

  // Data sharing
  sendData(data: string) {
    try {
      if (window.Telegram?.WebApp?.sendData) {
        window.Telegram.WebApp.sendData(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error sending data:', error);
      return false;
    }
  },

  // State getters
  isInitialized: () => isInitialized,
  getInitDataRaw: () => initDataRaw,
  getPlatform: () => platform
};

export default telegramSDK;
