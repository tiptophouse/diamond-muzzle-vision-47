// Compatibility Bridge for TelegramAuth Context
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  phone_number?: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  accessDeniedReason: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [contextValue, setContextValue] = useState<TelegramAuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    accessDeniedReason: null
  });

  // Use the optimized SDK
  const { 
    user, 
    isReady, 
    isTelegramEnvironment, 
    isInitializing,
    error 
  } = useTelegramSDK({ autoInit: true });

  // Update context value when SDK state changes
  useEffect(() => {
    const newContextValue: TelegramAuthContextType = {
      user,
      isAuthenticated: isReady && isTelegramEnvironment && !!user,
      isLoading: isInitializing || !isReady,
      error: error || null,
      isTelegramEnvironment,
      accessDeniedReason: error || null
    };

    setContextValue(newContextValue);

    console.log('🔍 TelegramAuthProvider (bridge) - updated state:', { 
      user: newContextValue.user?.first_name, 
      isAuthenticated: newContextValue.isAuthenticated,
      isTelegramEnvironment: newContextValue.isTelegramEnvironment,
      isLoading: newContextValue.isLoading
    });
  }, [user, isReady, isTelegramEnvironment, isInitializing, error]);

  return (
    <TelegramAuthContext.Provider value={contextValue}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth(): TelegramAuthContextType {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}