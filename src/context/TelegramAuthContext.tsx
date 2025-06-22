
import React, { createContext, useContext, ReactNode } from 'react';
import { useSimpleTelegramAuth } from '@/hooks/useSimpleTelegramAuth';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
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
  const authState = useSimpleTelegramAuth();

  return (
    <TelegramAuthContext.Provider value={authState}>
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
