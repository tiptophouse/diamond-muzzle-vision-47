// Unified Telegram WebApp SDK Manager
import { 
  TelegramWebApp, 
  TelegramSDKState, 
  TelegramEventType, 
  HapticFeedbackType, 
  HapticNotificationType,
  TelegramSafeAreaInset 
} from './types';

type SDKEventListener = (...args: any[]) => void;

export class TelegramSDK {
  private static instance: TelegramSDK | null = null;
  private webApp: TelegramWebApp | null = null;
  private state: TelegramSDKState;
  private eventListeners: Map<TelegramEventType, Set<SDKEventListener>> = new Map();
  private isInitializing = false;
  private initializationPromise: Promise<boolean> | null = null;

  private constructor() {
    this.state = {
      webApp: null,
      user: null,
      isInitialized: false,
      isReady: false,
      isTelegramEnvironment: false,
      platform: 'unknown',
      version: '1.0',
      colorScheme: 'light',
      themeParams: {},
      viewportHeight: 0,
      viewportStableHeight: 0,
      safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
      error: null
    };
  }

  public static getInstance(): TelegramSDK {
    if (!TelegramSDK.instance) {
      TelegramSDK.instance = new TelegramSDK();
    }
    return TelegramSDK.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.state.isInitialized) {
      return true;
    }

    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this.performInitialization();
    
    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<boolean> {
    console.log('🚀 TelegramSDK: Starting unified SDK initialization...');

    try {
      // Check for Telegram WebApp environment
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.warn('📱 TelegramSDK: Not running in Telegram WebApp environment - using fallback mode');
        this.updateState({
          isTelegramEnvironment: false,
          isInitialized: true,
          isReady: true,
          error: null
        });
        return false;
      }

      this.webApp = window.Telegram.WebApp as any as TelegramWebApp;
      console.log('✅ TelegramSDK: Telegram WebApp detected');

      // Initialize WebApp features
      await this.setupWebApp();

      // Set up event listeners
      this.setupEventListeners();

      // Apply iOS-specific optimizations
      this.applyIOSOptimizations();

      // Update final state
      this.updateState({
        webApp: this.webApp,
        user: this.webApp.initDataUnsafe?.user || null,
        isInitialized: true,
        isReady: true,
        isTelegramEnvironment: true,
        platform: this.webApp.platform,
        version: this.webApp.version,
        colorScheme: this.webApp.colorScheme,
        themeParams: this.webApp.themeParams,
        viewportHeight: this.webApp.viewportHeight,
        viewportStableHeight: this.webApp.viewportStableHeight,
        safeAreaInset: this.webApp.safeAreaInset || { top: 0, bottom: 0, left: 0, right: 0 },
        error: null
      });

      console.log('✅ TelegramSDK: Initialization complete', {
        version: this.webApp.version,
        platform: this.webApp.platform,
        user: this.webApp.initDataUnsafe?.user?.first_name
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('❌ TelegramSDK: Initialization failed:', errorMessage);
      
      this.updateState({
        isInitialized: true,
        isReady: false,
        error: errorMessage
      });

      return false;
    }
  }

  private async setupWebApp(): Promise<void> {
    if (!this.webApp) return;

    // Core initialization
    this.webApp.ready();
    this.webApp.expand();

    // Enhanced configuration
    this.webApp.enableClosingConfirmation();
    
    // Set optimal theme
    this.webApp.setHeaderColor('#1f2937');
    this.webApp.setBackgroundColor('#ffffff');

    // Setup viewport CSS variables
    this.updateViewportCSS();
  }

  private setupEventListeners(): void {
    if (!this.webApp) return;

    // Theme changes
    this.webApp.onEvent('themeChanged', () => {
      this.updateState({
        colorScheme: this.webApp!.colorScheme,
        themeParams: this.webApp!.themeParams
      });
      this.emit('themeChanged');
    });

    // Viewport changes
    this.webApp.onEvent('viewportChanged', () => {
      this.updateViewportCSS();
      this.updateState({
        viewportHeight: this.webApp!.viewportHeight,
        viewportStableHeight: this.webApp!.viewportStableHeight
      });
      this.emit('viewportChanged');
    });

    // Main button events
    this.webApp.onEvent('mainButtonClicked', () => {
      this.emit('mainButtonClicked');
    });

    // Back button events  
    this.webApp.onEvent('backButtonClicked', () => {
      this.emit('backButtonClicked');
    });
  }

  private applyIOSOptimizations(): void {
    if (!this.webApp) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('📱 TelegramSDK: Applying iOS optimizations');
      
      // Prevent zoom on input focus
      const metaViewport = document.querySelector('meta[name=viewport]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Handle safe area
      const safeArea = this.webApp.safeAreaInset;
      if (safeArea) {
        document.documentElement.style.setProperty('--tg-safe-area-top', `${safeArea.top}px`);
        document.documentElement.style.setProperty('--tg-safe-area-bottom', `${safeArea.bottom}px`);
        document.documentElement.style.setProperty('--tg-safe-area-left', `${safeArea.left}px`);
        document.documentElement.style.setProperty('--tg-safe-area-right', `${safeArea.right}px`);
      }
    }
  }

  private updateViewportCSS(): void {
    if (!this.webApp) return;

    document.documentElement.style.setProperty('--tg-viewport-height', `${this.webApp.viewportHeight}px`);
    document.documentElement.style.setProperty('--tg-viewport-stable-height', `${this.webApp.viewportStableHeight}px`);
  }

  private updateState(updates: Partial<TelegramSDKState>): void {
    this.state = { ...this.state, ...updates };
  }

  private emit(eventType: TelegramEventType, ...args: any[]): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }

  // Public API Methods
  public getState(): TelegramSDKState {
    return { ...this.state };
  }

  public on(eventType: TelegramEventType, listener: SDKEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  public off(eventType: TelegramEventType, listener: SDKEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  // Haptic Feedback
  public haptic = {
    impact: (style: HapticFeedbackType = 'medium') => {
      this.webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: HapticNotificationType) => {
      this.webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      this.webApp?.HapticFeedback?.selectionChanged();
    }
  };

  // Main Button Control
  public mainButton = {
    show: (text: string, onClick?: () => void, options?: { color?: string; textColor?: string }) => {
      if (!this.webApp?.MainButton) return;
      
      this.webApp.MainButton.setText(text);
      if (options?.color) this.webApp.MainButton.color = options.color;
      if (options?.textColor) this.webApp.MainButton.textColor = options.textColor;
      if (onClick) this.webApp.MainButton.onClick(onClick);
      this.webApp.MainButton.show();
    },
    hide: () => {
      this.webApp?.MainButton?.hide();
    },
    setText: (text: string) => {
      this.webApp?.MainButton?.setText(text);
    },
    enable: () => {
      this.webApp?.MainButton?.enable();
    },
    disable: () => {
      this.webApp?.MainButton?.disable();
    },
    showProgress: (leaveActive = false) => {
      this.webApp?.MainButton?.showProgress?.(leaveActive);
    },
    hideProgress: () => {
      this.webApp?.MainButton?.hideProgress?.();
    }
  };

  // Back Button Control
  public backButton = {
    show: (onClick?: () => void) => {
      if (!this.webApp?.BackButton) return;
      
      if (onClick) this.webApp.BackButton.onClick(onClick);
      this.webApp.BackButton.show();
    },
    hide: () => {
      this.webApp?.BackButton?.hide();
    }
  };

  // UI Utilities
  public ui = {
    showAlert: (message: string): Promise<void> => {
      return new Promise((resolve) => {
        if (this.webApp?.showAlert) {
          this.webApp.showAlert(message, () => resolve());
        } else {
          alert(message);
          resolve();
        }
      });
    },

    showConfirm: (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (this.webApp?.showConfirm) {
          this.webApp.showConfirm(message, (confirmed) => resolve(confirmed));
        } else {
          resolve(confirm(message));
        }
      });
    },

    showPopup: (params: {
      title?: string;
      message: string;
      buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
    }): Promise<string | undefined> => {
      return new Promise((resolve) => {
        if (this.webApp?.showPopup) {
          this.webApp.showPopup(params, (buttonId) => resolve(buttonId));
        } else {
          // Fallback to confirm/alert
          if (params.buttons && params.buttons.length > 1) {
            resolve(confirm(params.message) ? 'ok' : 'cancel');
          } else {
            alert(params.message);
            resolve('ok');
          }
        }
      });
    },

    openLink: (url: string, tryInstantView = true) => {
      this.webApp?.openLink(url, { try_instant_view: tryInstantView });
    },

    share: (text: string, url?: string) => {
      const shareText = url ? `${text}\n${url}` : text;
      this.webApp?.switchInlineQuery?.(shareText);
    },

    close: () => {
      this.webApp?.close();
    },

    shareToStory: (media_url: string, params?: {
      text?: string;
      widget_link?: { url: string; name?: string };
    }) => {
      if (this.webApp?.shareToStory) {
        this.webApp.shareToStory(media_url, params);
      } else {
        console.warn('shareToStory is not available in this Telegram version');
      }
    }
  };

  // Advanced Features
  public sensors = {
    accelerometer: {
      start: (refreshRate = 20, callback?: () => void) => {
        this.webApp?.Accelerometer?.start({ refresh_rate: refreshRate }, callback);
      },
      stop: (callback?: () => void) => {
        this.webApp?.Accelerometer?.stop(callback);
      },
      get: () => ({
        x: this.webApp?.Accelerometer?.x || 0,
        y: this.webApp?.Accelerometer?.y || 0,
        z: this.webApp?.Accelerometer?.z || 0,
        isStarted: this.webApp?.Accelerometer?.isStarted || false
      })
    },

    deviceOrientation: {
      start: (refreshRate = 20, needAbsolute = false, callback?: () => void) => {
        this.webApp?.DeviceOrientation?.start({ 
          refresh_rate: refreshRate, 
          need_absolute: needAbsolute 
        }, callback);
      },
      stop: (callback?: () => void) => {
        this.webApp?.DeviceOrientation?.stop(callback);
      },
      get: () => ({
        alpha: this.webApp?.DeviceOrientation?.alpha || 0,
        beta: this.webApp?.DeviceOrientation?.beta || 0,
        gamma: this.webApp?.DeviceOrientation?.gamma || 0,
        absolute: this.webApp?.DeviceOrientation?.absolute || false,
        isStarted: this.webApp?.DeviceOrientation?.isStarted || false
      })
    }
  };

  public storage = {
    setItem: (key: string, value: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (this.webApp?.CloudStorage) {
          this.webApp.CloudStorage.setItem(key, value, (error, success) => {
            if (error) {
              console.error('CloudStorage setItem error:', error);
              resolve(false);
            } else {
              resolve(success);
            }
          });
        } else {
          try {
            localStorage.setItem(`tg_${key}`, value);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    },

    getItem: (key: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (this.webApp?.CloudStorage) {
          this.webApp.CloudStorage.getItem(key, (error, value) => {
            if (error) {
              console.error('CloudStorage getItem error:', error);
              resolve(null);
            } else {
              resolve(value);
            }
          });
        } else {
          resolve(localStorage.getItem(`tg_${key}`));
        }
      });
    },

    removeItem: (key: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (this.webApp?.CloudStorage) {
          this.webApp.CloudStorage.removeItem(key, (error, success) => {
            if (error) {
              console.error('CloudStorage removeItem error:', error);
              resolve(false);
            } else {
              resolve(success);
            }
          });
        } else {
          try {
            localStorage.removeItem(`tg_${key}`);
            resolve(true);
          } catch {
            resolve(false);
          }
        }
      });
    }
  };

  public cleanup(): void {
    this.eventListeners.clear();
    this.state = {
      webApp: null,
      user: null,
      isInitialized: false,
      isReady: false,
      isTelegramEnvironment: false,
      platform: 'unknown',
      version: '1.0',
      colorScheme: 'light',
      themeParams: {},
      viewportHeight: 0,
      viewportStableHeight: 0,
      safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
      error: null
    };
    this.webApp = null;
  }
}

export const telegramSDK = TelegramSDK.getInstance();