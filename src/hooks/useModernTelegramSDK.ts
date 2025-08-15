
import { useState, useEffect, useCallback } from 'react';
import telegramSDK from '@/lib/telegramSDK';

interface TelegramSDKHookState {
  isInitialized: boolean;
  isLoading: boolean;
  user: any;
  startParam: string | null;
  themeParams: any;
  platform: string;
  version: string;
  error: string | null;
}

export function useModernTelegramSDK() {
  const [state, setState] = useState<TelegramSDKHookState>({
    isInitialized: false,
    isLoading: true,
    user: null,
    startParam: null,
    themeParams: {},
    platform: 'unknown',
    version: '1.0',
    error: null
  });

  useEffect(() => {
    const initSDK = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const success = await telegramSDK.initialize();
        
        if (success) {
          const sdkState = telegramSDK.getState();
          setState({
            isInitialized: sdkState.isInitialized,
            isLoading: false,
            user: sdkState.user,
            startParam: sdkState.startParam,
            themeParams: sdkState.themeParams,
            platform: sdkState.platform,
            version: sdkState.version,
            error: null
          });
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to initialize Telegram SDK'
          }));
        }
      } catch (error) {
        console.error('❌ SDK initialization error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    initSDK();

    return () => {
      telegramSDK.cleanup();
    };
  }, []);

  // Main Button controls
  const showMainButton = useCallback((
    text: string, 
    onClick: () => void, 
    options?: { color?: string; textColor?: string; isEnabled?: boolean }
  ) => {
    telegramSDK.showMainButton(text, onClick, options);
  }, []);

  const hideMainButton = useCallback(() => {
    telegramSDK.hideMainButton();
  }, []);

  // Back Button controls
  const showBackButton = useCallback((onClick: () => void) => {
    telegramSDK.showBackButton(onClick);
  }, []);

  const hideBackButton = useCallback(() => {
    telegramSDK.hideBackButton();
  }, []);

  // Haptic Feedback
  const impactFeedback = useCallback((style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    telegramSDK.impactFeedback(style);
  }, []);

  const notificationFeedback = useCallback((type?: 'error' | 'success' | 'warning') => {
    telegramSDK.notificationFeedback(type);
  }, []);

  const selectionFeedback = useCallback(() => {
    telegramSDK.selectionFeedback();
  }, []);

  // Cloud Storage
  const setCloudStorage = useCallback(async (key: string, value: string) => {
    return await telegramSDK.setCloudStorage(key, value);
  }, []);

  const getCloudStorage = useCallback(async (key: string) => {
    return await telegramSDK.getCloudStorage(key);
  }, []);

  // QR Scanner
  const scanQR = useCallback(async (text?: string) => {
    return await telegramSDK.scanQR(text);
  }, []);

  // Sharing & Navigation
  const shareURL = useCallback((url: string, text?: string) => {
    telegramSDK.shareURL(url, text);
  }, []);

  const switchInlineQuery = useCallback((query: string, chooseChatTypes?: string[]) => {
    telegramSDK.switchInlineQuery(query, chooseChatTypes);
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    telegramSDK.openTelegramLink(url);
  }, []);

  const openLink = useCallback((url: string, options?: { tryInstantView?: boolean }) => {
    telegramSDK.openLink(url, options);
  }, []);

  // Bridge Communication
  const sendData = useCallback((data: any) => {
    telegramSDK.sendData(data);
  }, []);

  // Invoice
  const openInvoice = useCallback(async (url: string) => {
    return await telegramSDK.openInvoice(url);
  }, []);

  // Biometry
  const requestBiometry = useCallback(async () => {
    return await telegramSDK.requestBiometry();
  }, []);

  // Getters
  const getInitData = useCallback(() => {
    return telegramSDK.getInitData();
  }, []);

  return {
    // State
    ...state,
    
    // Controls
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    
    // Feedback
    impactFeedback,
    notificationFeedback,
    selectionFeedback,
    
    // Storage
    setCloudStorage,
    getCloudStorage,
    
    // Scanner
    scanQR,
    
    // Sharing & Navigation
    shareURL,
    switchInlineQuery,
    openTelegramLink,
    openLink,
    
    // Communication
    sendData,
    getInitData,
    
    // Advanced
    openInvoice,
    requestBiometry
  };
}
