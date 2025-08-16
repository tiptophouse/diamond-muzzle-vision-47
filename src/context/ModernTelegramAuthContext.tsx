
import React, { createContext, useContext, ReactNode } from 'react';
import { useModernTelegramWebApp } from '@/hooks/useModernTelegramWebApp';
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
  accessDeniedReason: string | null;
}

const ModernTelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function ModernTelegramAuthProvider({ children }: { children: ReactNode }) {
  const { user, isReady } = useModernTelegramWebApp();
  
  console.log('🔍 ModernTelegramAuthProvider - Auth state:', { 
    user, 
    isReady
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(user, true);

  const authState: TelegramAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: !isReady,
    error: null,
    isTelegramEnvironment: true,
    accessDeniedReason: null
  };

  return (
    <ModernTelegramAuthContext.Provider value={authState}>
      {children}
    </ModernTelegramAuthContext.Provider>
  );
}

export function useModernTelegramAuth() {
  const context = useContext(ModernTelegramAuthContext);
  if (context === undefined) {
    throw new Error('useModernTelegramAuth must be used within a ModernTelegramAuthProvider');
  }
  return context;
}
