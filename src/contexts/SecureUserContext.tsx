
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { setCurrentUserId } from '@/lib/api';

interface SecureUserContextType {
  currentUserId: number | null;
  isUserVerified: boolean;
  userIsolationKey: string | null;
}

const SecureUserContext = createContext<SecureUserContextType | undefined>(undefined);

export function SecureUserProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useTelegramAuth();
  const [userIsolationKey, setUserIsolationKey] = useState<string | null>(null);
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated) {
      // Set secure user context
      setCurrentUserId(user.id);
      
      // Create unique isolation key for this user session
      const isolationKey = `user_${user.id}_${Date.now()}`;
      setUserIsolationKey(isolationKey);
      setIsUserVerified(true);
      
      console.log('🔒 User isolation established for:', user.id);
    } else {
      // Clear user context when not authenticated
      setUserIsolationKey(null);
      setIsUserVerified(false);
    }
  }, [user, isAuthenticated]);

  return (
    <SecureUserContext.Provider value={{
      currentUserId: user?.id || null,
      isUserVerified,
      userIsolationKey
    }}>
      {children}
    </SecureUserContext.Provider>
  );
}

export function useSecureUser() {
  const context = useContext(SecureUserContext);
  if (context === undefined) {
    throw new Error('useSecureUser must be used within a SecureUserProvider');
  }
  return context;
}
