import React, { createContext, useContext } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { TelegramUser } from '@/types/telegram';

interface AuthContextProps {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
}

const TelegramAuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useTelegramAuth = () => {
  const context = useContext(TelegramAuthContext);
  if (!context) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
};

export function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useStrictTelegramAuth();
  
  return (
    <TelegramAuthContext.Provider value={auth}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export { useTelegramAuth };
