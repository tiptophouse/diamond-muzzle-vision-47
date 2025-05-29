import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setCurrentUserId } from '@/lib/api';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshAuth: () => void;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeAuth = () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Initialize Telegram WebApp
        tg.ready();
        tg.expand();

        // Get user data from Telegram
        const telegramUser = tg.initDataUnsafe?.user;
        
        if (telegramUser) {
          setUser(telegramUser);
          setCurrentUserId(telegramUser.id); // Set user ID for API calls
          console.log('Telegram user authenticated:', telegramUser);
        } else {
          // For development, create a mock user
          const mockUser = {
            id: 123456789,
            first_name: 'John',
            last_name: 'Doe',
            username: 'johndoe'
          };
          setUser(mockUser);
          setCurrentUserId(mockUser.id); // Set mock user ID for API calls
          console.log('Using mock user for development:', mockUser);
        }
      } else {
        // For development when Telegram WebApp is not available
        const mockUser = {
          id: 123456789,
          first_name: 'John',
          last_name: 'Doe',
          username: 'johndoe'
        };
        setUser(mockUser);
        setCurrentUserId(mockUser.id); // Set mock user ID for API calls
        console.log('Telegram WebApp not available, using mock user:', mockUser);
      }
    } catch (err) {
      console.error('Error initializing Telegram auth:', err);
      setError('Failed to initialize Telegram authentication');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const refreshAuth = () => {
    initializeAuth();
  };

  const isAuthenticated = !!user;

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        refreshAuth,
      }}
    >
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
