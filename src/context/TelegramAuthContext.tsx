
import React, { createContext, useContext, ReactNode } from 'react';
import { useTelegramSDKUser, useTelegramSDKEnvironment } from '@/contexts/TelegramSDKContext';

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
  // Bridge to new SDK
  const { user, isReady, isTelegramEnvironment } = useTelegramSDKUser();
  const { error } = useTelegramSDKEnvironment();
  
  // Map new SDK state to old API
  const contextValue: TelegramAuthContextType = {
    user,
    isAuthenticated: isReady && isTelegramEnvironment && !!user,
    isLoading: !isReady,
    error: error || null,
    isTelegramEnvironment,
    accessDeniedReason: error || null
  };

  console.log('🔍 TelegramAuthProvider (compatibility) - state:', { 
    user: contextValue.user, 
    isAuthenticated: contextValue.isAuthenticated,
    isTelegramEnvironment: contextValue.isTelegramEnvironment,
    isLoading: contextValue.isLoading
  });

  return (
    <TelegramAuthContext.Provider value={contextValue}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}
