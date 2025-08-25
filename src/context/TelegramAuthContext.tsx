
import React, { createContext, useContext } from 'react';
import { useTelegramAuth as useTelegramAuthHook } from '@/hooks/useTelegramAuth';

interface TelegramAuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  jwtToken: string | null;
  isTelegramEnvironment: boolean;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const authData = useTelegramAuthHook();
  
  // Add isTelegramEnvironment check
  const contextValue = {
    ...authData,
    isTelegramEnvironment: typeof window !== 'undefined' && !!window.Telegram?.WebApp
  };
  
  return (
    <TelegramAuthContext.Provider value={contextValue}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    // Fallback to the actual hook
    const hookData = useTelegramAuthHook();
    return {
      ...hookData,
      isTelegramEnvironment: typeof window !== 'undefined' && !!window.Telegram?.WebApp
    };
  }
  return context;
}

// Export for backward compatibility
export { TelegramAuthContext };
