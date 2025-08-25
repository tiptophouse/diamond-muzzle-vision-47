
import { useState, useEffect, useRef } from 'react';
import { telegramAuth, type AuthResult, type TelegramUser } from '@/lib/telegram/SecureTelegramAuth';

interface TelegramAuthState {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  jwtToken: string | null;
}

export function useTelegramAuth(): TelegramAuthState {
  const [state, setState] = useState<TelegramAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    jwtToken: null
  });

  const mountedRef = useRef(true);
  const authAttempted = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const authenticate = async () => {
      if (authAttempted.current) return;
      authAttempted.current = true;

      try {
        console.log('🔐 Initiating Telegram authentication...');
        const result: AuthResult = await telegramAuth.authenticate();

        if (!mountedRef.current) return;

        if (result.success && result.user) {
          setState({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            jwtToken: result.jwt_token || null
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: result.error || 'Authentication failed',
            jwtToken: null
          });
        }
      } catch (error) {
        if (!mountedRef.current) return;
        
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
          jwtToken: null
        });
      }
    };

    // Add timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Authentication timeout'
        }));
      }
    }, 10000);

    authenticate();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
