
import React, { createContext, useContext, ReactNode } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';
import { SimpleLogin } from '@/components/auth/SimpleLogin';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
  const navigate = useNavigate();
  
  console.log('🔍 TelegramAuthProvider - Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    showLogin: authState.showLogin,
    isLoading: authState.isLoading
  });
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  // Auto-redirect to dashboard when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !authState.isLoading) {
      console.log('✅ User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, authState.user, authState.isLoading, navigate]);

  // Show loading state while initializing
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login page only if needed and not loading
  if (authState.showLogin && !authState.isLoading) {
    return <SimpleLogin onLogin={authState.handleLoginSuccess} />;
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
