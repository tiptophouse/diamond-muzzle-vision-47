/**
 * Advanced Telegram Mini App SDK Integration
 * Implements the latest Telegram Mini App features and best practices
 * Based on official Telegram documentation and 2024 features
 */

interface TelegramWebApp {
  // Core WebApp
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  
  // UI Elements
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  SettingsButton: TelegramSettingsButton;
  
  // Interactive Features
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;
  BiometricManager: TelegramBiometricManager;
  LocationManager: TelegramLocationManager;
  
  // Theme & Display
  themeParams: TelegramThemeParams;
  colorScheme: 'light' | 'dark';
  headerColor: string;
  backgroundColor: string;
  
  // Viewport
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  isFullscreen: boolean;
  
  // Device Info
  platform: string;
  version: string;
  
  // User Data
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat?: TelegramChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  
  // Methods
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  
  // Event System
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
  
  // Popups & Alerts
  showPopup: (params: TelegramPopupParams) => Promise<string>;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  showScanQrPopup: (params: { text?: string }) => Promise<string>;
  closeScanQrPopup: () => void;
  
  // Links & Navigation
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string) => void;
  
  // Permissions
  requestWriteAccess: () => Promise<boolean>;
  requestContact: () => Promise<boolean>;
  requestLocation: () => Promise<TelegramLocation>;
  
  // Clipboard
  readTextFromClipboard: () => Promise<string>;
  
  // Inline Queries
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  
  // Fullscreen (New 2024 feature)
  requestFullscreen: () => Promise<boolean>;
  exitFullscreen: () => void;
  
  // Home Screen Icon (New 2024 feature)
  addToHomeScreen: () => Promise<boolean>;
  
  // App Badge
  setAppBadge: (count: number) => void;
  clearAppBadge: () => void;
}

interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramSettingsButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TelegramCloudStorage {
  setItem: (key: string, value: string) => Promise<boolean>;
  getItem: (key: string) => Promise<string>;
  getItems: (keys: string[]) => Promise<Record<string, string>>;
  removeItem: (key: string) => Promise<boolean>;
  removeItems: (keys: string[]) => Promise<boolean>;
  getKeys: () => Promise<string[]>;
}

interface TelegramBiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init: () => Promise<void>;
  requestAccess: (params: { reason: string }) => Promise<boolean>;
  authenticate: (params: { reason: string }) => Promise<boolean>;
  updateBiometricToken: (token: string, callback?: (ok: boolean) => void) => void;
  openSettings: () => void;
}

interface TelegramLocationManager {
  isInited: boolean;
  isLocationAvailable: boolean;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  init: () => Promise<void>;
  getLocation: () => Promise<TelegramLocation>;
  openSettings: () => void;
}

interface TelegramLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  course?: number;
  speed?: number;
  horizontal_accuracy?: number;
  vertical_accuracy?: number;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: Array<{
    id?: string;
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    text: string;
  }>;
}

// Comment out duplicate Window interface - already declared in telegramWebApp.ts
// declare global {
//   interface Window {
//     Telegram?: {
//       WebApp: TelegramWebApp;
//     };
//   }
// }

class TelegramMiniAppSDK {
  private webApp: TelegramWebApp | null = null;
  private initialized = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    const webApp = window.Telegram?.WebApp;
    this.webApp = webApp as TelegramWebApp || null;
    
    if (!this.webApp) {
      console.warn('🔸 Telegram WebApp not available - running in development mode');
      return;
    }

    // Fast initialization - no try-catch for speed
    if (typeof this.webApp.ready === 'function') this.webApp.ready();
    if (typeof this.webApp.expand === 'function') this.webApp.expand();
    
    // Set up theme integration (synchronous, fast)
    this.setupThemeIntegration();
    
    // Set up event listeners (synchronous, fast)
    this.setupEventListeners();
    
    this.initialized = true;
    
    // Log minimal info for debugging
    console.log('🚀 Telegram SDK ready:', this.webApp.platform || 'unknown');
    
    // Initialize advanced features in background (non-blocking)
    this.initializeAdvancedFeatures().catch(err => 
      console.warn('⚠️ Advanced features init failed:', err)
    );
  }

  private setupThemeIntegration() {
    if (!this.webApp) return;

    // Apply theme to CSS custom properties
    const theme = (this.webApp as any).themeParams || {};
    const root = document.documentElement;

    // Map Telegram theme to CSS variables
    if (theme.bg_color) root.style.setProperty('--tg-bg-color', theme.bg_color);
    if (theme.text_color) root.style.setProperty('--tg-text-color', theme.text_color);
    if (theme.hint_color) root.style.setProperty('--tg-hint-color', theme.hint_color);
    if (theme.link_color) root.style.setProperty('--tg-link-color', theme.link_color);
    if (theme.button_color) root.style.setProperty('--tg-button-color', theme.button_color);
    if (theme.button_text_color) root.style.setProperty('--tg-button-text-color', theme.button_text_color);
    if (theme.secondary_bg_color) root.style.setProperty('--tg-secondary-bg-color', theme.secondary_bg_color);

    // Set viewport properties
    const viewportHeight = (this.webApp as any).viewportHeight || window.innerHeight;
    const stableHeight = (this.webApp as any).viewportStableHeight || window.innerHeight;
    root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
    root.style.setProperty('--tg-stable-height', `${stableHeight}px`);

    // Set color scheme
    const colorScheme = (this.webApp as any).colorScheme || 'light';
    root.setAttribute('data-telegram-theme', colorScheme);
  }

  private async initializeAdvancedFeatures() {
    if (!this.webApp) return;

    try {
      // Initialize Cloud Storage
      if ((this.webApp as any).CloudStorage) {
        console.log('☁️ Cloud Storage available');
      }

      // Initialize Biometric Manager
      const biometricManager = (this.webApp as any).BiometricManager;
      if (biometricManager && typeof biometricManager.init === 'function') {
        await biometricManager.init();
        console.log('👆 Biometric Manager initialized:', {
          available: biometricManager.isBiometricAvailable,
          type: biometricManager.biometricType,
          deviceId: biometricManager.deviceId
        });
      }

      // Initialize Location Manager
      const locationManager = (this.webApp as any).LocationManager;
      if (locationManager && typeof locationManager.init === 'function') {
        await locationManager.init();
        console.log('📍 Location Manager initialized:', {
          available: locationManager.isLocationAvailable
        });
      }
    } catch (error) {
      console.error('❌ Failed to initialize advanced features:', error);
    }
  }

  private setupEventListeners() {
    if (!this.webApp) return;

    // Viewport changes
    this.webApp.onEvent('viewportChanged', () => {
      this.setupThemeIntegration();
      this.emit('viewportChanged', {
        height: this.webApp!.viewportHeight,
        stableHeight: this.webApp!.viewportStableHeight,
        isExpanded: this.webApp!.isExpanded
      });
    });

    // Theme changes
    this.webApp.onEvent('themeChanged', () => {
      this.setupThemeIntegration();
      this.emit('themeChanged', this.webApp!.themeParams);
    });

    // Fullscreen changes
    this.webApp.onEvent('fullscreenChanged', () => {
      this.emit('fullscreenChanged', this.webApp!.isFullscreen);
    });

    // App lifecycle
    this.webApp.onEvent('activated', () => this.emit('activated'));
    this.webApp.onEvent('deactivated', () => this.emit('deactivated'));
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Core WebApp methods
  isInitialized() {
    return this.initialized;
  }

  getWebApp() {
    return this.webApp;
  }

  getUser() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  getChat() {
    return this.webApp?.initDataUnsafe?.chat || null;
  }

  // UI Controls
  mainButton = {
    show: (text: string, onClick: () => void, options?: { color?: string; textColor?: string }) => {
      if (!this.webApp?.MainButton) return;
      
      this.webApp.MainButton.setText(text);
      if (options?.color) this.webApp.MainButton.color = options.color;
      if (options?.textColor) this.webApp.MainButton.textColor = options.textColor;
      this.webApp.MainButton.onClick(onClick);
      this.webApp.MainButton.show();
    },
    hide: () => this.webApp?.MainButton?.hide(),
    setText: (text: string) => this.webApp?.MainButton?.setText(text),
    showProgress: () => this.webApp?.MainButton?.showProgress(),
    hideProgress: () => this.webApp?.MainButton?.hideProgress(),
    enable: () => this.webApp?.MainButton?.enable(),
    disable: () => this.webApp?.MainButton?.disable(),
  };

  backButton = {
    show: (onClick: () => void) => {
      if (!this.webApp?.BackButton) return;
      this.webApp.BackButton.onClick(onClick);
      this.webApp.BackButton.show();
    },
    hide: () => this.webApp?.BackButton?.hide(),
  };

  settingsButton = {
    show: (onClick: () => void) => {
      if (!this.webApp?.SettingsButton) return;
      this.webApp.SettingsButton.onClick(onClick);
      this.webApp.SettingsButton.show();
    },
    hide: () => this.webApp?.SettingsButton?.hide(),
  };

  // Haptic Feedback (disabled)
  hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      // Haptic feedback disabled
      return;
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      // Haptic feedback disabled
      return;
    },
    selection: () => {
      // Haptic feedback disabled
      return;
    },
  };

  // Cloud Storage
  cloudStorage = {
    setItem: async (key: string, value: string): Promise<boolean> => {
      if (!this.webApp?.CloudStorage) return false;
      return await this.webApp.CloudStorage.setItem(key, value);
    },
    getItem: async (key: string): Promise<string | null> => {
      if (!this.webApp?.CloudStorage) return null;
      try {
        return await this.webApp.CloudStorage.getItem(key);
      } catch {
        return null;
      }
    },
    removeItem: async (key: string): Promise<boolean> => {
      if (!this.webApp?.CloudStorage) return false;
      return await this.webApp.CloudStorage.removeItem(key);
    },
    getKeys: async (): Promise<string[]> => {
      if (!this.webApp?.CloudStorage) return [];
      return await this.webApp.CloudStorage.getKeys();
    },
  };

  // Biometric Authentication
  biometric = {
    isAvailable: () => this.webApp?.BiometricManager?.isBiometricAvailable || false,
    getType: () => this.webApp?.BiometricManager?.biometricType || 'unknown',
    requestAccess: async (reason: string): Promise<boolean> => {
      if (!this.webApp?.BiometricManager) return false;
      return await this.webApp.BiometricManager.requestAccess({ reason });
    },
    authenticate: async (reason: string): Promise<boolean> => {
      if (!this.webApp?.BiometricManager) return false;
      return await this.webApp.BiometricManager.authenticate({ reason });
    },
    updateToken: (token: string, callback?: (ok: boolean) => void) => {
      this.webApp?.BiometricManager?.updateBiometricToken(token, callback);
    },
  };

  // Location Services
  location = {
    isAvailable: () => this.webApp?.LocationManager?.isLocationAvailable || false,
    getLocation: async (): Promise<TelegramLocation | null> => {
      if (!this.webApp?.LocationManager) return null;
      try {
        return await this.webApp.LocationManager.getLocation();
      } catch {
        return null;
      }
    },
  };

  // Popups and Alerts
  showAlert = async (message: string): Promise<void> => {
    if (this.webApp?.showAlert) {
      return await this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  showConfirm = async (message: string): Promise<boolean> => {
    if (this.webApp?.showConfirm) {
      return await this.webApp.showConfirm(message);
    } else {
      return confirm(message);
    }
  };

  showPopup = async (params: TelegramPopupParams): Promise<string> => {
    if (this.webApp?.showPopup) {
      return await this.webApp.showPopup(params);
    } else {
      return confirm(params.message) ? 'ok' : 'cancel';
    }
  };

  // QR Scanner
  scanQr = async (text?: string): Promise<string | null> => {
    if (!this.webApp?.showScanQrPopup) return null;
    try {
      return await this.webApp.showScanQrPopup({ text });
    } catch {
      return null;
    }
  };

  // Links and Navigation
  openLink = (url: string, options?: { try_instant_view?: boolean }) => {
    this.webApp?.openLink(url, options);
  };

  openTelegramLink = (url: string) => {
    this.webApp?.openTelegramLink(url);
  };

  // Sharing
  share = (query: string, chatTypes?: string[]) => {
    this.webApp?.switchInlineQuery(query, chatTypes);
  };

  // Fullscreen (New 2024 feature)
  requestFullscreen = async (): Promise<boolean> => {
    if (!this.webApp?.requestFullscreen) return false;
    try {
      return await this.webApp.requestFullscreen();
    } catch {
      return false;
    }
  };

  exitFullscreen = () => {
    this.webApp?.exitFullscreen();
  };

  // Home Screen (New 2024 feature)
  addToHomeScreen = async (): Promise<boolean> => {
    if (!this.webApp?.addToHomeScreen) return false;
    try {
      return await this.webApp.addToHomeScreen();
    } catch {
      return false;
    }
  };

  // App Badge
  setBadge = (count: number) => {
    this.webApp?.setAppBadge(count);
  };

  clearBadge = () => {
    this.webApp?.clearAppBadge();
  };

  // Permissions
  requestWriteAccess = async (): Promise<boolean> => {
    if (!this.webApp?.requestWriteAccess) return false;
    return await this.webApp.requestWriteAccess();
  };

  requestContact = async (): Promise<boolean> => {
    if (!this.webApp?.requestContact) return false;
    return await this.webApp.requestContact();
  };

  // Clipboard
  readClipboard = async (): Promise<string | null> => {
    if (!this.webApp?.readTextFromClipboard) return null;
    try {
      return await this.webApp.readTextFromClipboard();
    } catch {
      return null;
    }
  };

  // Theme and Display
  setHeaderColor = (color: string) => {
    this.webApp?.setHeaderColor(color);
  };

  setBackgroundColor = (color: string) => {
    this.webApp?.setBackgroundColor(color);
  };

  getTheme = () => {
    return {
      colorScheme: this.webApp?.colorScheme || 'light',
      themeParams: this.webApp?.themeParams || {},
    };
  };

  // Device Info
  getDeviceInfo = () => {
    return {
      platform: this.webApp?.platform || 'unknown',
      version: this.webApp?.version || '1.0',
      viewportHeight: this.webApp?.viewportHeight || window.innerHeight,
      viewportStableHeight: this.webApp?.viewportStableHeight || window.innerHeight,
      isExpanded: this.webApp?.isExpanded || false,
      isFullscreen: this.webApp?.isFullscreen || false,
    };
  };

  // Lifecycle
  close = () => {
    this.webApp?.close();
  };

  sendData = (data: string) => {
    this.webApp?.sendData(data);
  };
}

// Create singleton instance
export const telegramSDK = new TelegramMiniAppSDK();
export default telegramSDK;