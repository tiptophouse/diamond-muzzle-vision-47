// Optimized replacement for useTelegramWebApp using the new SDK
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTelegramSDK } from './useTelegramSDK';

export function useOptimizedTelegramWebApp() {
  const {
    isInitialized,
    isTelegramEnvironment,
    user,
    initData,
    isInitDataValid,
    theme,
    error,
    haptic,
    mainButton,
    backButton,
    close,
    refresh,
    sdk
  } = useTelegramSDK();

  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  // Enhanced initialization with error handling
  useEffect(() => {
    if (!initRef.current && isTelegramEnvironment && isInitialized) {
      console.log('✅ Optimized Telegram WebApp ready');
      setIsReady(true);
      initRef.current = true;

      // Apply theme optimizations
      if (theme) {
        console.log('🎨 Theme applied:', theme.colorScheme);
      }
    }
  }, [isTelegramEnvironment, isInitialized, theme]);

  // Optimized methods using the SDK
  const showMainButton = useCallback((text: string, callback: () => void, color?: string) => {
    return mainButton.show(text, callback, color);
  }, [mainButton]);

  const hideMainButton = useCallback(() => {
    return mainButton.hide();
  }, [mainButton]);

  const showBackButton = useCallback((callback: () => void) => {
    return backButton.show(callback);
  }, [backButton]);

  const hideBackButton = useCallback(() => {
    return backButton.hide();
  }, [backButton]);

  // Haptic feedback shortcuts
  const impactHaptic = useCallback((style?: 'light' | 'medium' | 'heavy') => {
    haptic.impact(style);
  }, [haptic]);

  const notificationHaptic = useCallback((type?: 'error' | 'success' | 'warning') => {
    haptic.notification(type);
  }, [haptic]);

  const selectionHaptic = useCallback(() => {
    haptic.selection();
  }, [haptic]);

  // WebApp control methods
  const closeApp = useCallback(() => {
    close();
  }, [close]);

  const refreshData = useCallback(() => {
    refresh();
  }, [refresh]);

  return {
    // State
    isReady,
    isTelegramEnvironment,
    isInitialized,
    user,
    initData,
    isInitDataValid,
    theme,
    error,

    // Main button methods
    showMainButton,
    hideMainButton,

    // Back button methods
    showBackButton,
    hideBackButton,

    // Haptic feedback
    impactHaptic,
    notificationHaptic,
    selectionHaptic,

    // WebApp control
    closeApp,
    refreshData,

    // Direct access to SDK
    sdk,
    
    // Legacy compatibility
    webApp: sdk.getWebApp(),
    ready: () => isReady,
    expand: () => sdk.getWebApp()?.expand(),
  };
}