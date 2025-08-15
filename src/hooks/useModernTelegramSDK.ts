
import { useState, useEffect } from 'react';
import { telegramSDK } from '@/lib/telegramSDK';

export interface UseTelegramSDKReturn {
  isInitialized: boolean;
  isLoading: boolean;
  user: any;
  platform: string;
  webApp: any;
  showMainButton: (text: string, onClick?: () => void) => void;
  hideMainButton: () => void;
  impactFeedback: (style?: 'light' | 'medium' | 'heavy') => void;
  openTelegramLink: (url: string) => boolean;
  openLink: (url: string) => boolean;
  readTextFromClipboard: () => Promise<string>;
  scanQR: () => Promise<string | boolean>;
  sendData: (data: string) => boolean;
}

export function useModernTelegramSDK(): UseTelegramSDKReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const initialized = await telegramSDK.init();
        setIsInitialized(initialized);
        
        if (initialized) {
          const userData = telegramSDK.getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ Failed to initialize Telegram SDK:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSDK();
  }, []);

  return {
    isInitialized,
    isLoading,
    user,
    platform: telegramSDK.getPlatform(),
    webApp: null, // Keep for compatibility
    showMainButton: telegramSDK.showMainButton,
    hideMainButton: telegramSDK.hideMainButton,
    impactFeedback: telegramSDK.impactFeedback,
    openTelegramLink: telegramSDK.openTelegramLink,
    openLink: telegramSDK.openLink,
    readTextFromClipboard: telegramSDK.readTextFromClipboard,
    scanQR: telegramSDK.scanQR,
    sendData: telegramSDK.sendData,
  };
}
