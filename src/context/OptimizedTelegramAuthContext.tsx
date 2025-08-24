
import React, { createContext, useContext, ReactNode } from 'react';
import { useOptimizedTelegramAuth } from '@/hooks/useOptimizedTelegramAuth';

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
  
  console.log('🔒 StrictTelegramAuthProvider - Auth state:', { 
    user: authState.user?.first_name, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    authTime: authState.authTime ? `${authState.authTime}ms` : 'N/A',
    hasToken: !!authState.token,
    error: authState.error
  });

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
