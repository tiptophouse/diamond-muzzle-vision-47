// React hook for optimized Telegram SDK usage
import { useState, useEffect, useCallback, useRef } from 'react';
import { telegramSDK, TelegramUser } from '@/lib/telegram/telegramSDK';

interface TelegramSDKState {
  isInitialized: boolean;
  isTelegramEnvironment: boolean;
  user: TelegramUser | null;
  initData: string | null;
  isInitDataValid: boolean;
  theme: {
    colorScheme: 'light' | 'dark';
    themeParams: Record<string, string>;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
  } | null;
  error: string | null;
}

export function useTelegramSDK() {
  const [state, setState] = useState<TelegramSDKState>({
    isInitialized: false,
    isTelegramEnvironment: false,
    user: null,
    initData: null,
    isInitDataValid: false,
    theme: null,
    error: null
  });

  const initAttempted = useRef(false);

  const updateState = useCallback(() => {
    const isTelegramEnv = telegramSDK.isTelegramWebAppEnvironment();
    const user = telegramSDK.getUser();
    const initData = telegramSDK.getInitData();
    const isInitDataValid = telegramSDK.isInitDataValid();
    const theme = telegramSDK.getTheme();

    setState(prev => ({
      ...prev,
      isTelegramEnvironment: isTelegramEnv,
      user,
      initData,
      isInitDataValid,
      theme
    }));
  }, []);

  const initialize = useCallback(async () => {
    if (initAttempted.current) return;
    initAttempted.current = true;

    try {
      console.log('🚀 useTelegramSDK: Initializing...');
      setState(prev => ({ ...prev, error: null }));

      const success = await telegramSDK.initialize();
      
      setState(prev => ({
        ...prev,
        isInitialized: success,
        error: success ? null : 'Failed to initialize Telegram SDK'
      }));

      if (success) {
        updateState();
        console.log('✅ useTelegramSDK: Initialization successful');
      } else {
        console.warn('⚠️ useTelegramSDK: Initialization failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ useTelegramSDK: Initialization error:', errorMessage);
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: errorMessage
      }));
    }
  }, [updateState]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Optimized haptic feedback methods
  const haptic = {
    impact: useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      telegramSDK.haptic.impact(style);
    }, []),
    notification: useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
      telegramSDK.haptic.notification(type);
    }, []),
    selection: useCallback(() => {
      telegramSDK.haptic.selection();
    }, [])
  };

  // Main button methods
  const mainButton = {
    show: useCallback((text?: string, callback?: () => void) => telegramSDK.mainButton.show(text, callback), []),
    hide: useCallback(() => telegramSDK.mainButton.hide(), []),
    setText: useCallback((text: string) => telegramSDK.mainButton.setText(text), []),
    onClick: useCallback((callback: () => void) => telegramSDK.mainButton.onClick(callback), []),
    offClick: useCallback((callback: () => void) => telegramSDK.mainButton.offClick(callback), [])
  };

  // Back button methods  
  const backButton = {
    show: useCallback((callback?: () => void) => telegramSDK.backButton.show(callback), []),
    hide: useCallback(() => telegramSDK.backButton.hide(), []),
    onClick: useCallback((callback: () => void) => telegramSDK.backButton.onClick(callback), [])
  };

  // Close method
  const close = useCallback(() => {
    telegramSDK.close();
  }, []);

  // Refresh state method
  const refresh = useCallback(() => {
    updateState();
  }, [updateState]);

  return {
    ...state,
    haptic,
    mainButton,
    backButton,
    close,
    refresh,
    // Direct access to SDK for advanced usage
    sdk: telegramSDK
  };
}