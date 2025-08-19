
import React, { createContext, useContext, ReactNode } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

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
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, error, isTelegramEnvironment, isAuthenticated } = useTelegramAuth();
  
  console.log('🔍 TelegramAuthProvider - Auth state:', { 
    user: user, 
    isAuthenticated: isAuthenticated,
    isTelegramEnvironment: isTelegramEnvironment,
    isLoading: isLoading
  });

  return (
    <TelegramAuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      error,
      isTelegramEnvironment,
    }}>
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
