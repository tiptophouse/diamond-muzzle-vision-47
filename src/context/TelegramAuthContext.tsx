
import React, { createContext, useContext, ReactNode } from 'react';
import { useJWTAuth } from '@/hooks/useJWTAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';

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
  accessToken: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const authState = useJWTAuth();
  
  console.log('🔍 TelegramAuthProvider - JWT Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    hasToken: !!authState.accessToken,
    isTelegramEnvironment: authState.isTelegramEnvironment 
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  // Enhanced logging for JWT flow
  React.useEffect(() => {
    if (authState.isAuthenticated && authState.user && authState.accessToken) {
      console.log('✅ JWT Authentication complete - user authenticated with token');
      console.log('👤 User details:', {
        id: authState.user.id,
        name: authState.user.first_name,
        telegram: authState.isTelegramEnvironment,
        hasJWT: !!authState.accessToken
      });
    } else if (authState.error) {
      console.log('❌ JWT Authentication failed:', authState.error);
    } else if (authState.isLoading) {
      console.log('🔄 JWT Authentication in progress...');
    }
  }, [authState.isAuthenticated, authState.user, authState.accessToken, authState.error, authState.isLoading, authState.isTelegramEnvironment]);

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
