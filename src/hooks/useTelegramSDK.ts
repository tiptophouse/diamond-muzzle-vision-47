// Optimized React Hook for Telegram WebApp SDK
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { telegramSDK } from '@/lib/telegram/TelegramSDK';
import { TelegramSDKState, TelegramEventType } from '@/lib/telegram/types';

export interface UseTelegramSDKOptions {
  autoInit?: boolean;
  subscribeToEvents?: TelegramEventType[];
}

export function useTelegramSDK(options: UseTelegramSDKOptions = {}) {
  const { autoInit = true, subscribeToEvents = [] } = options;
  const [state, setState] = useState<TelegramSDKState>(telegramSDK.getState());
  const [isInitializing, setIsInitializing] = useState(false);
  const mountedRef = useRef(true);
  const eventListenersRef = useRef<Map<TelegramEventType, () => void>>(new Map());

  // Memoized state update function
  const updateState = useCallback(() => {
    if (mountedRef.current) {
      setState(telegramSDK.getState());
    }
  }, []);

  // Initialize SDK
  const initialize = useCallback(async (): Promise<boolean> => {
    if (isInitializing || state.isInitialized) {
      return state.isInitialized;
    }

    setIsInitializing(true);
    
    try {
      const success = await telegramSDK.initialize();
      updateState();
      return success;
    } catch (error) {
      console.error('useTelegramSDK: Initialization error:', error);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, state.isInitialized, updateState]);

  // Setup event subscriptions
  useEffect(() => {
    // Clear existing listeners
    eventListenersRef.current.forEach((listener, eventType) => {
      telegramSDK.off(eventType, listener);
    });
    eventListenersRef.current.clear();

    // Subscribe to requested events
    subscribeToEvents.forEach(eventType => {
      const listener = () => updateState();
      eventListenersRef.current.set(eventType, listener);
      telegramSDK.on(eventType, listener);
    });

    return () => {
      eventListenersRef.current.forEach((listener, eventType) => {
        telegramSDK.off(eventType, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [subscribeToEvents, updateState]);

  // Auto-initialization
  useEffect(() => {
    if (autoInit && !state.isInitialized && !isInitializing) {
      initialize();
    }
  }, [autoInit, state.isInitialized, isInitializing, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      eventListenersRef.current.forEach((listener, eventType) => {
        telegramSDK.off(eventType, listener);
      });
      eventListenersRef.current.clear();
    };
  }, []);

  // Memoized API objects to prevent unnecessary re-renders
  const haptic = useMemo(() => telegramSDK.haptic, []);
  const mainButton = useMemo(() => telegramSDK.mainButton, []);
  const backButton = useMemo(() => telegramSDK.backButton, []);
  const ui = useMemo(() => telegramSDK.ui, []);
  const sensors = useMemo(() => telegramSDK.sensors, []);
  const storage = useMemo(() => telegramSDK.storage, []);

  return {
    // State
    ...state,
    isInitializing,

    // Methods
    initialize,

    // API Objects (memoized)
    haptic,
    mainButton,
    backButton,
    ui,
    sensors,
    storage,

    // Event system
    on: telegramSDK.on.bind(telegramSDK),
    off: telegramSDK.off.bind(telegramSDK),

    // Raw SDK access for advanced usage
    sdk: telegramSDK
  };
}

// Specialized hooks for common use cases
export function useTelegramUser() {
  const { user, isReady, isTelegramEnvironment } = useTelegramSDK({
    subscribeToEvents: []
  });
  
  return {
    user,
    isAvailable: isReady && isTelegramEnvironment && !!user,
    isReady,
    isTelegramEnvironment
  };
}

export function useTelegramTheme() {
  const { colorScheme, themeParams, isReady } = useTelegramSDK({
    subscribeToEvents: ['themeChanged']
  });

  return {
    colorScheme,
    themeParams,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    isReady
  };
}

export function useTelegramViewport() {
  const { 
    viewportHeight, 
    viewportStableHeight, 
    safeAreaInset, 
    isReady 
  } = useTelegramSDK({
    subscribeToEvents: ['viewportChanged']
  });

  return {
    viewportHeight,
    viewportStableHeight,
    safeAreaInset,
    isReady
  };
}

export function useTelegramHaptics() {
  const { haptic, isReady, isTelegramEnvironment } = useTelegramSDK();

  return {
    ...haptic,
    isAvailable: isReady && isTelegramEnvironment
  };
}

export function useTelegramNavigation() {
  const { mainButton, backButton, isReady, isTelegramEnvironment } = useTelegramSDK();

  return {
    mainButton,
    backButton,
    isAvailable: isReady && isTelegramEnvironment
  };
}