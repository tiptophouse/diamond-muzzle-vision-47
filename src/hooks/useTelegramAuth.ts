
import { useState, useEffect, useCallback } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface AuthState {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTelegramAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const authenticate = useCallback(async (userData: TelegramUser) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await verifyTelegramUser({
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        photo_url: userData.photo_url,
        auth_date: userData.auth_date,
        hash: userData.hash,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Check if verification was successful
      if (response.data && !response.data.error) {
        setCurrentUserId(userData.id);
        
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Store user data in localStorage for persistence
        localStorage.setItem('telegram_user', JSON.stringify(userData));
        localStorage.setItem('telegram_user_id', userData.id.toString());
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('telegram_user_id');
  }, []);

  // Initialize auth state from localStorage or Telegram WebApp
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if running in Telegram WebApp
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          webApp.ready();

          if (webApp.initDataUnsafe?.user) {
            const user = webApp.initDataUnsafe.user;
            await authenticate({
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              photo_url: user.photo_url,
              auth_date: Date.now(),
              hash: webApp.initData || '',
            });
            return;
          }
        }

        // Check localStorage for existing session
        const storedUser = localStorage.getItem('telegram_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          setCurrentUserId(userData.id);
          return;
        }

        // No authentication found
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initAuth();
  }, [authenticate]);

  return {
    ...authState,
    authenticate,
    logout,
  };
}
