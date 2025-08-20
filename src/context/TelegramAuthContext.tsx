
import React, { createContext, useContext, ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';
import { SimpleLogin } from '@/components/auth/SimpleLogin';

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
  
  console.log('🔍 TelegramAuthProvider - Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    showLogin: authState.showLogin
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  // Only show login if NOT in Telegram environment OR if explicitly needed
  // If coming from Telegram, we should have user data and not need login
  if (authState.showLogin && !authState.isTelegramEnvironment) {
    return <SimpleLogin onLogin={authState.handleLoginSuccess} />;
  }

  // If coming from outside Telegram and no user, block access
  if (!authState.isTelegramEnvironment && !authState.user && !authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            This application can only be accessed through the official Telegram bot.
          </p>
          <p className="text-sm text-gray-500">
            Please use the Telegram Mini App to access this service.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TelegramAuthContext.Provider value={{
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
      isTelegramEnvironment: authState.isTelegramEnvironment,
      accessDeniedReason: authState.accessDeniedReason,
    }}>
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
