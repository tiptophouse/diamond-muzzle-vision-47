
import React, { createContext, useContext, ReactNode } from 'react';
import { useSecureFastAPIAuth } from '@/hooks/useSecureFastAPIAuth';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface SecureFastAPIAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  jwtUserId: number | null;
}

const SecureFastAPIAuthContext = createContext<SecureFastAPIAuthContextType | undefined>(undefined);

export function SecureFastAPIAuthProvider({ children }: { children: ReactNode }) {
  const authState = useSecureFastAPIAuth();
  
  console.log('🔍 SecureFastAPIAuthProvider - Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    jwtUserId: authState.jwtUserId,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    error: authState.error
  });

  return (
    <SecureFastAPIAuthContext.Provider value={authState}>
      {children}
    </SecureFastAPIAuthContext.Provider>
  );
}

export function useSecureFastAPIAuthContext() {
  const context = useContext(SecureFastAPIAuthContext);
  if (context === undefined) {
    throw new Error('useSecureFastAPIAuthContext must be used within a SecureFastAPIAuthProvider');
  }
  return context;
}
