
import React, { createContext, useContext, ReactNode } from 'react';
import { useSecureTelegramAuth } from '@/hooks/useSecureTelegramAuth';

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
  console.log('🔧 TelegramAuthProvider: Initializing...');
  
  const authState = useSecureTelegramAuth();
  
  console.log('🔧 TelegramAuthProvider: Auth state:', {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user?.id,
    error: authState.error
  });

  return (
    <TelegramAuthContext.Provider value={authState}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  console.log('🔧 useTelegramAuth: Getting context...');
  const context = useContext(TelegramAuthContext);
  console.log('🔧 useTelegramAuth: Context value:', context ? 'Found' : 'Undefined');
  
  if (context === undefined) {
    console.error('❌ useTelegramAuth: Context is undefined - Provider not found');
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}
