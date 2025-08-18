
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useStrictTelegramAuth } from '@/hooks/useStrictTelegramAuth';
import { useUserDataPersistence } from '@/hooks/useUserDataPersistence';
import { SecureLogin } from '@/components/auth/SecureLogin';

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
  logout: () => void;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const authState = useStrictTelegramAuth();
  const [isSecureLogin, setIsSecureLogin] = useState(false);
  const [secureAuthToken, setSecureAuthToken] = useState<string | null>(null);
  
  console.log('🔍 TelegramAuthProvider - Auth state:', { 
    user: authState.user, 
    isAuthenticated: authState.isAuthenticated,
    isTelegramEnvironment: authState.isTelegramEnvironment,
    showLogin: authState.showLogin
  });

  // Check for existing secure auth token
  useEffect(() => {
    const existingToken = localStorage.getItem('auth_token');
    if (existingToken) {
      setSecureAuthToken(existingToken);
      setIsSecureLogin(false);
    }
  }, []);

  // Enhanced security check
  useEffect(() => {
    const checkSecurityRequirements = () => {
      // In production, require either Telegram auth OR secure login
      if (process.env.NODE_ENV === 'production') {
        if (!authState.isTelegramEnvironment && !secureAuthToken) {
          console.log('🔒 Production security: Requiring secure login');
          setIsSecureLogin(true);
          return;
        }
      }
      
      // If we have Telegram auth, use it
      if (authState.isAuthenticated && authState.user) {
        setIsSecureLogin(false);
        return;
      }
      
      // If no auth at all, show login
      if (authState.showLogin && !secureAuthToken) {
        setIsSecureLogin(true);
      }
    };

    checkSecurityRequirements();
  }, [authState, secureAuthToken]);
  
  // Automatically persist user data when authenticated
  useUserDataPersistence(authState.user, authState.isTelegramEnvironment);

  const handleSecureLoginSuccess = (token: string) => {
    console.log('✅ Secure login successful');
    setSecureAuthToken(token);
    setIsSecureLogin(false);
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    setSecureAuthToken(null);
    setIsSecureLogin(true);
    
    // Also trigger Telegram logout if applicable
    if (authState.user) {
      // Clear any Telegram-specific auth state
      window.location.reload();
    }
  };

  // Show secure login if needed
  if (isSecureLogin) {
    return <SecureLogin onLoginSuccess={handleSecureLoginSuccess} />;
  }

  // Show Telegram login if needed
  if (authState.showLogin && !secureAuthToken) {
    return <SecureLogin onLoginSuccess={handleSecureLoginSuccess} />;
  }

  // Determine final auth state
  const finalUser = authState.user || (secureAuthToken ? {
    id: 2138564172, // Admin fallback when using secure login
    first_name: 'Admin',
    last_name: 'User',
    username: 'admin'
  } : null);

  const finalIsAuthenticated = authState.isAuthenticated || !!secureAuthToken;

  return (
    <TelegramAuthContext.Provider value={{
      user: finalUser,
      isAuthenticated: finalIsAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
      isTelegramEnvironment: authState.isTelegramEnvironment,
      accessDeniedReason: authState.accessDeniedReason,
      logout,
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
