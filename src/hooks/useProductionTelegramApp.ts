import { useState, useEffect, useCallback, useRef } from 'react';

interface TelegramWebAppExtended {
  initData: string;
  initDataUnsafe: any;
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  themeParams: any;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  headerColor?: string;
  backgroundColor?: string;
  isClosingConfirmationEnabled?: boolean;
  
  // Methods
  ready: () => void;
  expand: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  
  // Events
  onEvent?: (eventType: string, eventHandler: () => void) => void;
  offEvent?: (eventType: string, eventHandler: () => void) => void;
  
  // UI Controls
  MainButton?: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  
  BackButton?: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  
  SettingsButton?: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  
  // Cloud Storage
  CloudStorage?: {
    setItem: (key: string, value: string, callback?: (error: string | null, result?: boolean) => void) => void;
    getItem: (key: string, callback: (error: string | null, result?: string) => void) => void;
    getItems: (keys: string[], callback: (error: string | null, result?: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: string | null, result?: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: string | null, result?: boolean) => void) => void;
    getKeys: (callback: (error: string | null, result?: string[]) => void) => void;
  };
  
  // Utils
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  showPopup?: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  showConfirm?: (message: string, callback?: (confirmed: boolean) => void) => void;
}

interface ProductionTelegramState {
  webApp: TelegramWebAppExtended | null;
  user: any;
  isReady: boolean;
  platform: string | null;
  colorScheme: 'light' | 'dark';
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function useProductionTelegramApp() {
  const [state, setState] = useState<ProductionTelegramState>({
    webApp: null,
    user: null,
    isReady: false,
    platform: null,
    colorScheme: 'light',
    viewportHeight: 0,
    viewportStableHeight: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  const initializationRef = useRef(false);
  const viewportHandlerRef = useRef<(() => void) | null>(null);
  const themeHandlerRef = useRef<(() => void) | null>(null);
  
  // Initialize Telegram WebApp
  const initialize = useCallback(() => {
    if (initializationRef.current) return;
    
    const tg = window.Telegram?.WebApp as TelegramWebAppExtended;
    if (!tg) {
      console.log('🔍 Production Telegram: Not in Telegram environment');
      setState(prev => ({ ...prev, isReady: true }));
      return;
    }
    
    initializationRef.current = true;
    console.log('🚀 Production Telegram: Initializing...');
    
    // Prepare the app
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    
    // Set theme colors to match our design system
    const isDark = tg.colorScheme === 'dark';
    tg.setHeaderColor?.(isDark ? '#0a0a0a' : '#ffffff');
    tg.setBackgroundColor?.(isDark ? '#0a0a0a' : '#fafafa');
    
    // Update CSS variables for Telegram theme integration
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set Telegram CSS variables
    root.style.setProperty('--tg-viewport-height', `${tg.viewportHeight || window.innerHeight}px`);
    root.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight || window.innerHeight}px`);
    
    // Calculate safe area insets
    const safeAreaInsets = {
      top: parseInt(getComputedStyle(root).getPropertyValue('--tg-safe-area-inset-top') || '0'),
      bottom: parseInt(getComputedStyle(root).getPropertyValue('--tg-safe-area-inset-bottom') || '0'),
      left: parseInt(getComputedStyle(root).getPropertyValue('--tg-safe-area-inset-left') || '0'),
      right: parseInt(getComputedStyle(root).getPropertyValue('--tg-safe-area-inset-right') || '0'),
    };
    
    setState({
      webApp: tg,
      user: tg.initDataUnsafe?.user || null,
      isReady: true,
      platform: tg.platform || 'unknown',
      colorScheme: tg.colorScheme || 'light',
      viewportHeight: tg.viewportHeight || window.innerHeight,
      viewportStableHeight: tg.viewportStableHeight || window.innerHeight,
      safeAreaInsets
    });
    
    // Set up viewport change handler
    viewportHandlerRef.current = () => {
      const newViewportHeight = tg.viewportHeight || window.innerHeight;
      const newViewportStableHeight = tg.viewportStableHeight || window.innerHeight;
      
      root.style.setProperty('--tg-viewport-height', `${newViewportHeight}px`);
      root.style.setProperty('--tg-viewport-stable-height', `${newViewportStableHeight}px`);
      
      setState(prev => ({
        ...prev,
        viewportHeight: newViewportHeight,
        viewportStableHeight: newViewportStableHeight
      }));
    };
    
    // Set up theme change handler
    themeHandlerRef.current = () => {
      const newColorScheme = tg.colorScheme || 'light';
      const isDark = newColorScheme === 'dark';
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      tg.setHeaderColor?.(isDark ? '#0a0a0a' : '#ffffff');
      tg.setBackgroundColor?.(isDark ? '#0a0a0a' : '#fafafa');
      
      setState(prev => ({
        ...prev,
        colorScheme: newColorScheme
      }));
    };
    
    // Register event handlers if available
    if (tg.onEvent) {
      tg.onEvent('viewportChanged', viewportHandlerRef.current);
      tg.onEvent('themeChanged', themeHandlerRef.current);
    }
    
    console.log('✅ Production Telegram: Initialized successfully', {
      platform: tg.platform || 'unknown',
      colorScheme: tg.colorScheme || 'light',
      viewportHeight: tg.viewportHeight || window.innerHeight,
      user: tg.initDataUnsafe?.user
    });
    
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (state.webApp && state.webApp.offEvent && viewportHandlerRef.current && themeHandlerRef.current) {
        state.webApp.offEvent('viewportChanged', viewportHandlerRef.current);
        state.webApp.offEvent('themeChanged', themeHandlerRef.current);
      }
    };
  }, [state.webApp]);
  
  // Initialize on mount
  useEffect(() => {
    // Small delay to ensure Telegram WebApp is fully loaded
    const timer = setTimeout(initialize, 100);
    return () => clearTimeout(timer);
  }, [initialize]);
  
  // Production-ready helpers
  const haptic = useCallback(() => ({
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      state.webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      state.webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      state.webApp?.HapticFeedback?.selectionChanged();
    }
  }), [state.webApp]);
  
  const mainButton = useCallback(() => ({
    show: (text: string, onClick: () => void, options?: { color?: string; textColor?: string }) => {
      if (!state.webApp?.MainButton) return;
      
      const btn = state.webApp.MainButton;
      btn.setText(text);
      if (options?.color) btn.color = options.color;
      if (options?.textColor) btn.textColor = options.textColor;
      btn.onClick(onClick);
      btn.show();
    },
    hide: () => {
      state.webApp?.MainButton?.hide();
    },
    showProgress: () => {
      state.webApp?.MainButton?.showProgress();
    },
    hideProgress: () => {
      state.webApp?.MainButton?.hideProgress();
    }
  }), [state.webApp]);
  
  const backButton = useCallback(() => ({
    show: (onClick: () => void) => {
      if (!state.webApp?.BackButton) return;
      state.webApp.BackButton.onClick(onClick);
      state.webApp.BackButton.show();
    },
    hide: () => {
      state.webApp?.BackButton?.hide();
    }
  }), [state.webApp]);
  
  const cloudStorage = useCallback(() => ({
    setItem: (key: string, value: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        if (!state.webApp?.CloudStorage) {
          reject(new Error('CloudStorage not available'));
          return;
        }
        
        state.webApp.CloudStorage.setItem(key, value, (error, result) => {
          if (error) reject(new Error(error));
          else resolve(result || false);
        });
      });
    },
    
    getItem: (key: string): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        if (!state.webApp?.CloudStorage) {
          reject(new Error('CloudStorage not available'));
          return;
        }
        
        state.webApp.CloudStorage.getItem(key, (error, result) => {
          if (error) reject(new Error(error));
          else resolve(result || null);
        });
      });
    },
    
    removeItem: (key: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        if (!state.webApp?.CloudStorage) {
          reject(new Error('CloudStorage not available'));
          return;
        }
        
        state.webApp.CloudStorage.removeItem(key, (error, result) => {
          if (error) reject(new Error(error));
          else resolve(result || false);
        });
      });
    }
  }), [state.webApp]);
  
  const utils = useCallback(() => ({
    openLink: (url: string) => {
      state.webApp?.openLink(url);
    },
    openTelegramLink: (url: string) => {
      state.webApp?.openTelegramLink(url);
    },
    showAlert: (message: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!state.webApp) {
          window.alert(message);
          resolve();
          return;
        }
        
        state.webApp.showAlert(message, () => resolve());
      });
    },
    showConfirm: (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!state.webApp) {
          resolve(window.confirm(message));
          return;
        }
        
        state.webApp.showConfirm(message, (confirmed) => resolve(confirmed));
      });
    },
    close: () => {
      state.webApp?.close();
    }
  }), [state.webApp]);
  
  return {
    ...state,
    haptic: haptic(),
    mainButton: mainButton(),
    backButton: backButton(),
    cloudStorage: cloudStorage(),
    utils: utils(),
    isTelegramEnvironment: !!state.webApp
  };
}