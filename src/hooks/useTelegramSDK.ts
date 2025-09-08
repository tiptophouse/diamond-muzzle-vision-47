/**
 * React Hook for Telegram Mini App SDK
 * Provides easy access to all Telegram Mini App features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import telegramSDK from '@/services/TelegramMiniAppSDK';

interface TelegramSDKState {
  isInitialized: boolean;
  user: any;
  chat: any;
    theme: {
      colorScheme: 'light' | 'dark';
      themeParams: Record<string, string>;
    };
  device: {
    platform: string;
    version: string;
    viewportHeight: number;
    viewportStableHeight: number;
    isExpanded: boolean;
    isFullscreen: boolean;
  };
  features: {
    cloudStorage: boolean;
    biometric: boolean;
    location: boolean;
    fullscreen: boolean;
    homeScreen: boolean;
  };
}

export function useTelegramSDK() {
  const [state, setState] = useState<TelegramSDKState>({
    isInitialized: false,
    user: null,
    chat: null,
    theme: {
      colorScheme: 'light',
      themeParams: {},
    },
    device: {
      platform: 'unknown',
      version: '1.0',
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      isExpanded: false,
      isFullscreen: false,
    },
    features: {
      cloudStorage: false,
      biometric: false,
      location: false,
      fullscreen: false,
      homeScreen: false,
    },
  });

  const mountedRef = useRef(true);

  // Update state from SDK
  const updateState = useCallback(() => {
    if (!mountedRef.current) return;

    const webApp = telegramSDK.getWebApp();
    
    setState({
      isInitialized: telegramSDK.isInitialized(),
      user: telegramSDK.getUser(),
      chat: telegramSDK.getChat(),
      theme: telegramSDK.getTheme() as { colorScheme: "light" | "dark"; themeParams: Record<string, string>; },
      device: telegramSDK.getDeviceInfo(),
      features: {
        cloudStorage: !!webApp?.CloudStorage,
        biometric: !!webApp?.BiometricManager,
        location: !!webApp?.LocationManager,
        fullscreen: typeof webApp?.requestFullscreen === 'function',
        homeScreen: typeof webApp?.addToHomeScreen === 'function',
      },
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial state update
    const initialUpdate = () => {
      if (telegramSDK.isInitialized()) {
        updateState();
      } else {
        // Wait for initialization
        setTimeout(initialUpdate, 100);
      }
    };
    initialUpdate();

    // Listen for SDK events
    const handleViewportChange = () => updateState();
    const handleThemeChange = () => updateState();
    const handleFullscreenChange = () => updateState();

    telegramSDK.on('viewportChanged', handleViewportChange);
    telegramSDK.on('themeChanged', handleThemeChange);
    telegramSDK.on('fullscreenChanged', handleFullscreenChange);

    return () => {
      mountedRef.current = false;
      telegramSDK.off('viewportChanged', handleViewportChange);
      telegramSDK.off('themeChanged', handleThemeChange);
      telegramSDK.off('fullscreenChanged', handleFullscreenChange);
    };
  }, [updateState]);

  // UI Controls
  const mainButton = {
    show: useCallback((text: string, onClick: () => void, options?: { color?: string; textColor?: string }) => {
      telegramSDK.mainButton.show(text, onClick, options);
    }, []),
    hide: useCallback(() => {
      telegramSDK.mainButton.hide();
    }, []),
    setText: useCallback((text: string) => {
      telegramSDK.mainButton.setText(text);
    }, []),
    showProgress: useCallback(() => {
      telegramSDK.mainButton.showProgress();
    }, []),
    hideProgress: useCallback(() => {
      telegramSDK.mainButton.hideProgress();
    }, []),
    enable: useCallback(() => {
      telegramSDK.mainButton.enable();
    }, []),
    disable: useCallback(() => {
      telegramSDK.mainButton.disable();
    }, []),
  };

  const backButton = {
    show: useCallback((onClick: () => void) => {
      telegramSDK.backButton.show(onClick);
    }, []),
    hide: useCallback(() => {
      telegramSDK.backButton.hide();
    }, []),
  };

  const settingsButton = {
    show: useCallback((onClick: () => void) => {
      telegramSDK.settingsButton.show(onClick);
    }, []),
    hide: useCallback(() => {
      telegramSDK.settingsButton.hide();
    }, []),
  };

  // Haptic Feedback
  const haptic = {
    impact: useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      telegramSDK.hapticFeedback.impact(style);
    }, []),
    notification: useCallback((type: 'error' | 'success' | 'warning') => {
      telegramSDK.hapticFeedback.notification(type);
    }, []),
    selection: useCallback(() => {
      telegramSDK.hapticFeedback.selection();
    }, []),
  };

  // Cloud Storage
  const cloudStorage = {
    setItem: useCallback(async (key: string, value: string) => {
      return await telegramSDK.cloudStorage.setItem(key, value);
    }, []),
    getItem: useCallback(async (key: string) => {
      return await telegramSDK.cloudStorage.getItem(key);
    }, []),
    removeItem: useCallback(async (key: string) => {
      return await telegramSDK.cloudStorage.removeItem(key);
    }, []),
    getKeys: useCallback(async () => {
      return await telegramSDK.cloudStorage.getKeys();
    }, []),
  };

  // Biometric Authentication
  const biometric = {
    isAvailable: useCallback(() => {
      return telegramSDK.biometric.isAvailable();
    }, []),
    getType: useCallback(() => {
      return telegramSDK.biometric.getType();
    }, []),
    requestAccess: useCallback(async (reason: string) => {
      return await telegramSDK.biometric.requestAccess(reason);
    }, []),
    authenticate: useCallback(async (reason: string) => {
      return await telegramSDK.biometric.authenticate(reason);
    }, []),
    updateToken: useCallback((token: string, callback?: (ok: boolean) => void) => {
      telegramSDK.biometric.updateToken(token, callback);
    }, []),
  };

  // Location Services
  const location = {
    isAvailable: useCallback(() => {
      return telegramSDK.location.isAvailable();
    }, []),
    getLocation: useCallback(async () => {
      return await telegramSDK.location.getLocation();
    }, []),
  };

  // Popups and Alerts
  const showAlert = useCallback(async (message: string) => {
    return await telegramSDK.showAlert(message);
  }, []);

  const showConfirm = useCallback(async (message: string) => {
    return await telegramSDK.showConfirm(message);
  }, []);

  const showPopup = useCallback(async (params: any) => {
    return await telegramSDK.showPopup(params);
  }, []);

  // QR Scanner
  const scanQr = useCallback(async (text?: string) => {
    return await telegramSDK.scanQr(text);
  }, []);

  // Navigation and Links
  const openLink = useCallback((url: string, options?: { try_instant_view?: boolean }) => {
    telegramSDK.openLink(url, options);
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    telegramSDK.openTelegramLink(url);
  }, []);

  const share = useCallback((query: string, chatTypes?: string[]) => {
    telegramSDK.share(query, chatTypes);
  }, []);

  // Fullscreen (New 2024 feature)
  const requestFullscreen = useCallback(async () => {
    return await telegramSDK.requestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    telegramSDK.exitFullscreen();
  }, []);

  // Home Screen (New 2024 feature)
  const addToHomeScreen = useCallback(async () => {
    return await telegramSDK.addToHomeScreen();
  }, []);

  // App Badge
  const setBadge = useCallback((count: number) => {
    telegramSDK.setBadge(count);
  }, []);

  const clearBadge = useCallback(() => {
    telegramSDK.clearBadge();
  }, []);

  // Theme and Display
  const setHeaderColor = useCallback((color: string) => {
    telegramSDK.setHeaderColor(color);
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    telegramSDK.setBackgroundColor(color);
  }, []);

  // Permissions
  const requestWriteAccess = useCallback(async () => {
    return await telegramSDK.requestWriteAccess();
  }, []);

  const requestContact = useCallback(async () => {
    return await telegramSDK.requestContact();
  }, []);

  // Clipboard
  const readClipboard = useCallback(async () => {
    return await telegramSDK.readClipboard();
  }, []);

  // Lifecycle
  const close = useCallback(() => {
    telegramSDK.close();
  }, []);

  const sendData = useCallback((data: string) => {
    telegramSDK.sendData(data);
  }, []);

  return {
    // State
    ...state,
    
    // UI Controls
    mainButton,
    backButton,
    settingsButton,
    
    // Interactions
    haptic,
    showAlert,
    showConfirm,
    showPopup,
    scanQr,
    
    // Storage
    cloudStorage,
    
    // Authentication
    biometric,
    
    // Location
    location,
    
    // Navigation
    openLink,
    openTelegramLink,
    share,
    
    // 2024 Features
    requestFullscreen,
    exitFullscreen,
    addToHomeScreen,
    setBadge,
    clearBadge,
    
    // Theme
    setHeaderColor,
    setBackgroundColor,
    
    // Permissions
    requestWriteAccess,
    requestContact,
    
    // Clipboard
    readClipboard,
    
    // Lifecycle
    close,
    sendData,
  };
}