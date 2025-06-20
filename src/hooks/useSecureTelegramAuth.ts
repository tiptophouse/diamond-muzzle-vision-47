
import { useState, useEffect, useCallback } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { isTelegramWebAppEnvironment, parseTelegramInitData, validateTelegramInitData } from '@/utils/telegramWebApp';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface AuthState {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
}

export function useSecureTelegramAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
  });

  const authenticate = useCallback(async (userData: TelegramUser) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Strict validation - only allow Telegram environment authentication
      if (!isTelegramWebAppEnvironment()) {
        throw new Error('Authentication only allowed through Telegram WebApp');
      }

      const response = await verifyTelegramUser({
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        photo_url: userData.photo_url,
        auth_date: Date.now(),
        hash: window.Telegram?.WebApp?.initData || '',
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data && !response.data.error) {
        setCurrentUserId(userData.id);
        
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isTelegramEnvironment: true,
        });

        // Store user data securely
        localStorage.setItem('telegram_user', JSON.stringify(userData));
        localStorage.setItem('telegram_user_id', userData.id.toString());
        localStorage.setItem('auth_method', 'telegram_webapp');
      } else {
        throw new Error('Authentication failed - invalid Telegram data');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        isTelegramEnvironment: isTelegramWebAppEnvironment(),
      });
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isTelegramEnvironment: isTelegramWebAppEnvironment(),
    });
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('telegram_user_id');
    localStorage.removeItem('auth_method');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Only allow Telegram WebApp environment
        const isTgEnv = isTelegramWebAppEnvironment();
        
        if (!isTgEnv) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Telegram WebApp environment required',
            isTelegramEnvironment: false,
          });
          return;
        }

        // Check for Telegram WebApp data
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
          const webApp = window.Telegram.WebApp;
          webApp.ready();

          // Validate initData
          if (!validateTelegramInitData(webApp.initData || '')) {
            throw new Error('Invalid or expired Telegram initData');
          }

          const user = webApp.initDataUnsafe.user;
          await authenticate({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            language_code: user.language_code,
            is_premium: user.is_premium,
          });
          return;
        }

        // Check localStorage but validate it's from Telegram
        const storedUser = localStorage.getItem('telegram_user');
        const authMethod = localStorage.getItem('auth_method');
        
        if (storedUser && authMethod === 'telegram_webapp') {
          const userData = JSON.parse(storedUser);
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isTelegramEnvironment: true,
          });
          setCurrentUserId(userData.id);
          return;
        }

        // No valid authentication found
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isTelegramEnvironment: true,
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize Telegram authentication',
          isTelegramEnvironment: isTelegramWebAppEnvironment(),
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
