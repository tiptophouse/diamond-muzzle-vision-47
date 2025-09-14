// Optimized Telegram SDK Manager
// Single source of truth for all Telegram WebApp functionality

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppInterface {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    [key: string]: any;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  themeParams: Record<string, string>;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  
  // Data sending method for legacy compatibility
  sendData?: (data: string) => void;
  
  // Accelerometer and device orientation (optional features)
  Accelerometer?: {
    isStarted: boolean;
    start: (params?: { refresh_rate?: number }) => void;
    stop: () => void;
  };
  DeviceOrientation?: {
    isStarted: boolean;
    start: (params?: { refresh_rate?: number }) => void;
    stop: () => void;
  };
  
  // Orientation control (optional features)
  lockOrientation?: (orientation: 'portrait' | 'landscape') => void;
  unlockOrientation?: () => void;
  
  // Additional WebApp features for compatibility
  version?: string;
  platform?: string;
  headerColor?: string;
  backgroundColor?: string;
  
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  onEvent: (eventType: string, callback: Function) => void;
  offEvent: (eventType: string, callback: Function) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebAppInterface;
    };
  }
}

class TelegramSDKManager {
  private static instance: TelegramSDKManager;
  private webApp: TelegramWebAppInterface | null = null;
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;
  private environmentChecked = false;
  private isTelegramEnv = false;

  private constructor() {}

  public static getInstance(): TelegramSDKManager {
    if (!TelegramSDKManager.instance) {
      TelegramSDKManager.instance = new TelegramSDKManager();
    }
    return TelegramSDKManager.instance;
  }

  /**
   * Check if we're in a Telegram WebApp environment with caching
   */
  public isTelegramWebAppEnvironment(): boolean {
    if (this.environmentChecked) {
      return this.isTelegramEnv;
    }

    if (typeof window === 'undefined') {
      this.isTelegramEnv = false;
    } else {
      this.isTelegramEnv = !!(
        window.Telegram?.WebApp &&
        typeof window.Telegram.WebApp === 'object' &&
        typeof window.Telegram.WebApp.ready === 'function'
      );
    }

    this.environmentChecked = true;
    return this.isTelegramEnv;
  }

  /**
   * Get Telegram WebApp instance with lazy initialization
   */
  public getWebApp(): TelegramWebAppInterface | null {
    if (!this.isTelegramWebAppEnvironment()) {
      return null;
    }

    if (!this.webApp) {
      this.webApp = window.Telegram!.WebApp;
    }

    return this.webApp;
  }

  /**
   * Initialize Telegram WebApp with promise caching
   */
  public async initialize(): Promise<boolean> {
    // Return cached promise if initialization is already in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return true if already initialized
    if (this.isInitialized) {
      return true;
    }

    this.initPromise = this._performInitialization();
    const result = await this.initPromise;
    this.initPromise = null; // Clear promise after completion
    
    return result;
  }

  private async _performInitialization(): Promise<boolean> {
    try {
      console.log('📱 TelegramSDK: Starting initialization...');
      
      if (!this.isTelegramWebAppEnvironment()) {
        console.log('📱 TelegramSDK: Not in Telegram environment');
        return false;
      }

      const webApp = this.getWebApp();
      if (!webApp) {
        console.error('📱 TelegramSDK: WebApp instance not available');
        return false;
      }

      // Initialize WebApp with error handling
      try {
        webApp.ready();
        console.log('✅ TelegramSDK: ready() called successfully');
      } catch (error) {
        console.warn('⚠️ TelegramSDK: ready() failed:', error);
      }

      try {
        webApp.expand();
        console.log('✅ TelegramSDK: expand() called successfully');
      } catch (error) {
        console.warn('⚠️ TelegramSDK: expand() failed:', error);
      }

      this.isInitialized = true;
      console.log('✅ TelegramSDK: Initialization completed successfully');
      return true;

    } catch (error) {
      console.error('❌ TelegramSDK: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Get current user with validation
   */
  public getUser(): TelegramUser | null {
    const webApp = this.getWebApp();
    if (!webApp || !webApp.initDataUnsafe?.user) {
      return null;
    }

    const user = webApp.initDataUnsafe.user;
    
    // Validate user object
    if (typeof user.id !== 'number' || !user.first_name) {
      console.warn('📱 TelegramSDK: Invalid user data');
      return null;
    }

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium,
      photo_url: user.photo_url
    };
  }

  /**
   * Get initData with validation
   */
  public getInitData(): string | null {
    const webApp = this.getWebApp();
    if (!webApp) {
      return null;
    }

    return webApp.initData || null;
  }

  /**
   * Validate initData freshness
   */
  public isInitDataValid(): boolean {
    const webApp = this.getWebApp();
    if (!webApp || !webApp.initData) {
      return false;
    }

    try {
      const urlParams = new URLSearchParams(webApp.initData);
      const authDate = urlParams.get('auth_date');
      
      if (!authDate) {
        return false;
      }

      // Check if data is not older than 24 hours (more practical than 1 minute)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      return (now - authDateTime) <= maxAge;
    } catch (error) {
      console.error('📱 TelegramSDK: Failed to validate initData:', error);
      return false;
    }
  }

  /**
   * Optimized haptic feedback
   */
  public haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      try {
        this.getWebApp()?.HapticFeedback?.impactOccurred(style);
      } catch (error) {
        console.warn('📱 TelegramSDK: Haptic impact failed:', error);
      }
    },
    
    notification: (type: 'error' | 'success' | 'warning' = 'success') => {
      try {
        this.getWebApp()?.HapticFeedback?.notificationOccurred(type);
      } catch (error) {
        console.warn('📱 TelegramSDK: Haptic notification failed:', error);
      }
    },
    
    selection: () => {
      try {
        this.getWebApp()?.HapticFeedback?.selectionChanged();
      } catch (error) {
        console.warn('📱 TelegramSDK: Haptic selection failed:', error);
      }
    }
  };

  /**
   * Main button controller with optimized API
   */
  public mainButton = {
    show: (text?: string, callback?: () => void) => {
      const webApp = this.getWebApp();
      if (!webApp?.MainButton) return false;

      try {
        if (text) webApp.MainButton.setText(text);
        if (callback) webApp.MainButton.onClick(callback);
        webApp.MainButton.show();
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Main button show failed:', error);
        return false;
      }
    },
    
    hide: () => {
      try {
        this.getWebApp()?.MainButton?.hide();
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Main button hide failed:', error);
        return false;
      }
    },
    
    setText: (text: string) => {
      try {
        this.getWebApp()?.MainButton?.setText(text);
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Main button setText failed:', error);
        return false;
      }
    },
    
    onClick: (callback: () => void) => {
      try {
        this.getWebApp()?.MainButton?.onClick(callback);
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Main button onClick failed:', error);
        return false;
      }
    },
    
    offClick: (callback: () => void) => {
      try {
        this.getWebApp()?.MainButton?.offClick(callback);
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Main button offClick failed:', error);
        return false;
      }
    }
  };

  /**
   * Back button controller
   */
  public backButton = {
    show: (callback?: () => void) => {
      const webApp = this.getWebApp();
      if (!webApp?.BackButton) return false;

      try {
        if (callback) webApp.BackButton.onClick(callback);
        webApp.BackButton.show();
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Back button show failed:', error);
        return false;
      }
    },
    
    hide: () => {
      try {
        this.getWebApp()?.BackButton?.hide();
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Back button hide failed:', error);
        return false;
      }
    },
    
    onClick: (callback: () => void) => {
      try {
        this.getWebApp()?.BackButton?.onClick(callback);
        return true;
      } catch (error) {
        console.warn('📱 TelegramSDK: Back button onClick failed:', error);
        return false;
      }
    }
  };

  /**
   * Close the WebApp
   */
  public close(): void {
    try {
      this.getWebApp()?.close();
    } catch (error) {
      console.warn('📱 TelegramSDK: Close failed:', error);
    }
  }

  /**
   * Get theme information
   */
  public getTheme() {
    const webApp = this.getWebApp();
    if (!webApp) return null;

    return {
      colorScheme: webApp.colorScheme || 'light',
      themeParams: webApp.themeParams || {},
      isExpanded: webApp.isExpanded || false,
      viewportHeight: webApp.viewportHeight || window.innerHeight,
      viewportStableHeight: webApp.viewportStableHeight || window.innerHeight
    };
  }

  /**
   * Reset initialization state (for testing)
   */
  public reset(): void {
    this.isInitialized = false;
    this.initPromise = null;
    this.environmentChecked = false;
    this.webApp = null;
  }
}

// Export singleton instance
export const telegramSDK = TelegramSDKManager.getInstance();

// Convenience exports for backward compatibility
export const isTelegramWebAppEnvironment = () => telegramSDK.isTelegramWebAppEnvironment();
export const getTelegramWebApp = () => telegramSDK.getWebApp();
export const initializeTelegramWebApp = () => telegramSDK.initialize();