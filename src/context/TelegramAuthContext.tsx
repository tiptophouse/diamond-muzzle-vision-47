
import React, { createContext, useContext, ReactNode } from 'react';
import { useOptimizedTelegramAuth } from '@/hooks/useOptimizedTelegramAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';
import { BlockingAuthError } from '@/components/auth/BlockingAuthError';

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
  const authState = useOptimizedTelegramAuth();
  
  console.log('🔍 TelegramAuthProvider - Optimized auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    loadTime: authState.loadTime
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  // Show blocking error for critical auth failures
  if (authState.error && authState.accessDeniedReason && 
      ['not_telegram_environment', 'no_init_data', 'invalid_init_data'].includes(authState.accessDeniedReason)) {
    return <BlockingAuthError error={authState.error} reason={authState.accessDeniedReason} />;
  }

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
