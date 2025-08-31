
import React, { createContext, useContext, ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';
import { logTelegramEnvironment } from '@/utils/initDataDebugger';

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
  const authState = useStrictTelegramAuth();
  
  // 🐛 DEBUG: Log complete Telegram environment on provider initialization
  React.useEffect(() => {
    logTelegramEnvironment();
  }, []);
  
  console.log('🔍 TelegramAuthProvider - Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment 
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  // Enhanced logging for analytics debugging
  React.useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      console.log('✅ User authenticated - analytics tracking should initialize');
      console.log('👤 User details:', {
        id: authState.user.id,
        name: authState.user.first_name,
        telegram: authState.isTelegramEnvironment
      });
    } else {
      console.log('❌ User not authenticated - analytics tracking disabled');
    }
  }, [authState.isAuthenticated, authState.user, authState.isTelegramEnvironment]);

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
