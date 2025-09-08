// React Context for Telegram SDK State Management
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { TelegramSDKState } from '@/lib/telegram/types';

interface TelegramSDKContextType extends TelegramSDKState {
  initialize: () => Promise<boolean>;
  isInitializing: boolean;
}

const TelegramSDKContext = createContext<TelegramSDKContextType | undefined>(undefined);

export interface TelegramSDKProviderProps {
  children: ReactNode;
  autoInit?: boolean;
}

export function TelegramSDKProvider({ 
  children, 
  autoInit = true 
}: TelegramSDKProviderProps) {
  const sdkState = useTelegramSDK({ 
    autoInit,
    subscribeToEvents: ['themeChanged', 'viewportChanged', 'mainButtonClicked', 'backButtonClicked']
  });

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    webApp: sdkState.webApp,
    user: sdkState.user,
    isInitialized: sdkState.isInitialized,
    isReady: sdkState.isReady,
    isTelegramEnvironment: sdkState.isTelegramEnvironment,
    platform: sdkState.platform,
    version: sdkState.version,
    colorScheme: sdkState.colorScheme,
    themeParams: sdkState.themeParams,
    viewportHeight: sdkState.viewportHeight,
    viewportStableHeight: sdkState.viewportStableHeight,
    safeAreaInset: sdkState.safeAreaInset,
    error: sdkState.error,
    initialize: sdkState.initialize,
    isInitializing: sdkState.isInitializing
  }), [
    sdkState.webApp,
    sdkState.user,
    sdkState.isInitialized,
    sdkState.isReady,
    sdkState.isTelegramEnvironment,
    sdkState.platform,
    sdkState.version,
    sdkState.colorScheme,
    sdkState.themeParams,
    sdkState.viewportHeight,
    sdkState.viewportStableHeight,
    sdkState.safeAreaInset,
    sdkState.error,
    sdkState.initialize,
    sdkState.isInitializing
  ]);

  // Debug logging in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 TelegramSDKProvider state:', {
        isReady: sdkState.isReady,
        isTelegramEnvironment: sdkState.isTelegramEnvironment,
        user: sdkState.user?.first_name,
        platform: sdkState.platform,
        version: sdkState.version
      });
    }
  }, [
    sdkState.isReady,
    sdkState.isTelegramEnvironment,
    sdkState.user,
    sdkState.platform,
    sdkState.version
  ]);

  return (
    <TelegramSDKContext.Provider value={contextValue}>
      {children}
    </TelegramSDKContext.Provider>
  );
}

// Context hook with error boundary
export function useTelegramSDKContext(): TelegramSDKContextType {
  const context = useContext(TelegramSDKContext);
  
  if (context === undefined) {
    throw new Error(
      'useTelegramSDKContext must be used within a TelegramSDKProvider. ' +
      'Make sure your component is wrapped with <TelegramSDKProvider>.'
    );
  }
  
  return context;
}

// Selective context hooks for performance optimization
export function useTelegramSDKUser() {
  const { user, isReady, isTelegramEnvironment } = useTelegramSDKContext();
  return { user, isReady, isTelegramEnvironment };
}

export function useTelegramSDKTheme() {
  const { colorScheme, themeParams } = useTelegramSDKContext();
  return { colorScheme, themeParams };
}

export function useTelegramSDKViewport() {
  const { viewportHeight, viewportStableHeight, safeAreaInset } = useTelegramSDKContext();
  return { viewportHeight, viewportStableHeight, safeAreaInset };
}

export function useTelegramSDKEnvironment() {
  const { 
    isTelegramEnvironment, 
    isReady, 
    platform, 
    version,
    error 
  } = useTelegramSDKContext();
  
  return { 
    isTelegramEnvironment, 
    isReady, 
    platform, 
    version,
    error
  };
}