
import React, { createContext, useContext, ReactNode } from 'react';
import { useTelegramInit } from '@/hooks/useTelegramInit';
import { TelegramUser, TelegramInitData } from '@/types/telegram';

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshAuth: () => void;
  retryAuth: () => void;
  initData: TelegramInitData | null;
  isTelegramEnvironment: boolean;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    initData,
    isLoading,
    error,
    isTelegramEnvironment,
    refreshAuth,
    retryAuth,
  } = useTelegramInit();

  // Enhanced authentication check - prioritize real users
  const isAuthenticated = !!user && !error;

  // Enhanced logging for debugging
  console.log('🔍 TelegramAuthContext status:', {
    hasUser: !!user,
    userId: user?.id,
    userName: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'None',
    isAuthenticated,
    isLoading,
    error,
    isTelegramEnvironment,
    isRealUser: user && user.id !== 2138564172,
    isMockUser: user?.id === 2138564172
  });

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        refreshAuth,
        retryAuth,
        initData,
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
