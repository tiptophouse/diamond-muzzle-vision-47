
import React, { createContext, useContext, ReactNode } from 'react';
import { useTelegramAuth as useTelegramAuthHook } from '@/hooks/useTelegramAuth';
import { TelegramUser } from '@/types/telegram';

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
  } = useTelegramAuthHook();

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        isTelegramEnvironment,
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
