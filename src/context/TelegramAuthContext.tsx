
import React, { createContext, useContext } from 'react';
import { useTelegramAuth as useTelegramAuthHook } from '@/hooks/useTelegramAuth';

interface TelegramAuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  jwtToken: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const authData = useTelegramAuthHook();
  
  return (
    <TelegramAuthContext.Provider value={authData}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    // Fallback to the actual hook
    return useTelegramAuthHook();
  }
  return context;
}

// Export for backward compatibility
export { TelegramAuthContext };
