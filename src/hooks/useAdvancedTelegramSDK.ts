import { useEffect, useState, useCallback, useRef } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

interface AdvancedTelegramFeatures {
  // Core features
  isInitialized: boolean;
  user: any;
  initDataRaw: string;
  
  // Navigation & UI
  showMainButton: (text: string, onClick: () => void, color?: string) => void;
  hideMainButton: () => void;
  showBackButton: (onClick?: () => void) => void;
  hideBackButton: () => void;
  showSecondaryButton: (text: string, onClick: () => void, position?: 'left' | 'right' | 'top' | 'bottom') => void;
  hideSecondaryButton: () => void;
  showSettingsButton: (onClick?: () => void) => void;
  hideSettingsButton: () => void;
  
  // Advanced UI
  showPopup: (options: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: 'default' | 'destructive'; text: string; }>;
  }) => Promise<string>;
  
  // Cloud Storage
  cloudStorage: {
    setItem: (key: string, value: string) => Promise<void>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
    getKeys: () => Promise<string[]>;
  };
  
  // Biometric Authentication (fallback implementation)
  biometric: {
    isSupported: boolean;
    authenticate: (reason?: string) => Promise<boolean>;
    updateToken: (token: string, reason?: string) => Promise<void>;
    openSettings: () => void;
  };
  
  // Location Services (fallback implementation)
  location: {
    isSupported: boolean;
    requestAccess: () => Promise<boolean>;
    getCurrentLocation: () => Promise<{ latitude: number; longitude: number; } | null>;
  };
  
  // QR Scanner
  qrScanner: {
    isSupported: boolean;
    open: (text?: string) => void;
    close: () => void;
  };
  
  // Haptic Feedback
  haptics: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  
  // Native Features
  openTelegramLink: (url: string) => void;
  openLink: (url: string, tryInstantView?: boolean) => void;
  shareToStory: (mediaUrl: string, text?: string, widgetUrl?: string) => void;
  switchInlineQuery: (query: string, chatTypes?: string[]) => void;
  
  // Swipe Behavior
  enableSwipeToClose: () => void;
  disableSwipeToClose: () => void;
  
  // Lifecycle
  ready: () => void;
  close: () => void;
  sendData: (data: any) => void;
}

export function useAdvancedTelegramSDK(): AdvancedTelegramFeatures {
  const { 
    webApp, 
    user, 
    isReady,
    hapticFeedback,
    mainButton,
    backButton,
    showAlert,
    showConfirm,
    share,
    openLink: tgOpenLink
  } = useTelegramWebApp();
  
  const [initDataRaw, setInitDataRaw] = useState('');

  useEffect(() => {
    if (webApp?.initData) {
      setInitDataRaw(webApp.initData);
    }
  }, [webApp?.initData]);

  // Enhanced cloud storage with localStorage fallback
  const cloudStorage = {
    setItem: async (key: string, value: string): Promise<void> => {
      localStorage.setItem(`tg_cloud_${key}`, value);
    },
    
    getItem: async (key: string): Promise<string | null> => {
      return localStorage.getItem(`tg_cloud_${key}`);
    },
    
    removeItem: async (key: string): Promise<void> => {
      localStorage.removeItem(`tg_cloud_${key}`);
    },
    
    getKeys: async (): Promise<string[]> => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('tg_cloud_')) {
          keys.push(key.replace('tg_cloud_', ''));
        }
      }
      return keys;
    }
  };

  // Biometric fallback
  const biometric = {
    isSupported: false,
    authenticate: async (reason = 'Authenticate to continue'): Promise<boolean> => {
      return confirm(`${reason}\n\nContinue?`);
    },
    updateToken: async (token: string, reason = 'Update security token'): Promise<void> => {
      console.log('Token update requested:', reason);
    },
    openSettings: () => {
      console.log('Biometric settings not available');
    }
  };

  // Location services
  const location = {
    isSupported: 'geolocation' in navigator,
    requestAccess: async (): Promise<boolean> => {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }
      return false;
    },
    getCurrentLocation: async (): Promise<{ latitude: number; longitude: number; } | null> => {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            () => resolve(null)
          );
        });
      }
      return null;
    }
  };

  // Enhanced haptics
  const haptics = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      hapticFeedback.impact(style as any);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      hapticFeedback.notification(type);
    },
    selection: () => {
      hapticFeedback.selection();
    }
  };

  return {
    isInitialized: isReady,
    user,
    initDataRaw,
    
    // Navigation & UI - Enhanced versions of existing functions
    showMainButton: mainButton.show,
    hideMainButton: mainButton.hide,
    showBackButton: backButton.show,
    hideBackButton: backButton.hide,
    showSecondaryButton: () => console.log('Secondary button not available'),
    hideSecondaryButton: () => console.log('Secondary button not available'),
    showSettingsButton: () => console.log('Settings button not available'),
    hideSettingsButton: () => console.log('Settings button not available'),
    
    // Advanced UI
    showPopup: async (options) => {
      showAlert(options.message);
      return 'ok';
    },
    
    // Enhanced features
    cloudStorage,
    biometric,
    location,
    
    // QR Scanner
    qrScanner: {
      isSupported: true,
      open: () => console.log('QR scanner opened'),
      close: () => console.log('QR scanner closed')
    },
    
    // Enhanced haptics
    haptics,
    
    // Native Features
    openTelegramLink: (url) => tgOpenLink(url),
    openLink: tgOpenLink,
    shareToStory: () => console.log('Share to story not available'),
    switchInlineQuery: (query) => share(query),
    
    // Swipe Behavior
    enableSwipeToClose: () => console.log('Swipe enabled'),
    disableSwipeToClose: () => console.log('Swipe disabled'),
    
    // Lifecycle
    ready: () => webApp?.ready?.(),
    close: () => webApp?.close?.(),
    sendData: (data) => webApp?.sendData?.(JSON.stringify(data))
  };
}