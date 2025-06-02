
import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedTelegramAuth } from '@/hooks/useEnhancedTelegramAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';
import { TelegramUser } from '@/types/telegram';

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  retryAuth: () => void;
  retryCount: number;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
    retryAuth,
    retryCount,
  } = useEnhancedTelegramAuth();

  // Handle user data persistence in background
  useUserDataPersistence(user, isTelegramEnvironment);

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        isTelegramEnvironment,
        retryAuth,
        retryCount,
      }}
    >
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
