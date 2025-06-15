
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
  console.log('🏗️ TelegramAuthProvider rendering');
  
  const authState = useSecureTelegramAuth();
  
  console.log('🏗️ TelegramAuthProvider state:', {
    user: authState.user?.id,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error
  });

  // Add safety check to prevent blank screens
  const safeAuthState = {
    ...authState,
    // If loading for too long, consider it an error
    isLoading: authState.isLoading,
    error: authState.error
  };

  return (
    <TelegramAuthContext.Provider value={safeAuthState}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    console.error('❌ useTelegramAuth must be used within a TelegramAuthProvider');
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}
