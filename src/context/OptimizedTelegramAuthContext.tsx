
import React, { createContext, useContext, ReactNode } from 'react';
import { useOptimizedTelegramAuth } from '@/hooks/useOptimizedTelegramAuth';
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

interface OptimizedTelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  token: string | null;
  authTime?: number;
}

const OptimizedTelegramAuthContext = createContext<OptimizedTelegramAuthContextType | undefined>(undefined);

export function OptimizedTelegramAuthProvider({ children }: { children: ReactNode }) {
  const authState = useOptimizedTelegramAuth();
  
  console.log('🔍 OptimizedTelegramAuthProvider - Auth state:', { 
    user: authState.user?.first_name, 
    isAuthenticated: authState.isAuthenticated,
    authTime: authState.authTime ? `${authState.authTime}ms` : 'N/A',
    hasToken: !!authState.token
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  return (
    <OptimizedTelegramAuthContext.Provider value={authState}>
      {children}
    </OptimizedTelegramAuthContext.Provider>
  );
}

export function useOptimizedTelegramAuthContext() {
  const context = useContext(OptimizedTelegramAuthContext);
  if (context === undefined) {
    throw new Error('useOptimizedTelegramAuthContext must be used within an OptimizedTelegramAuthProvider');
  }
  return context;
}
