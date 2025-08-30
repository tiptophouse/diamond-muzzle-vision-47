
import React, { createContext, useContext, ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
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
  const authState = useStrictTelegramAuth();

  return (
    <TelegramAuthContext.Provider value={authState}>
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
