
import { useState, useEffect, useRef } from 'react';
import { TelegramAuthService } from '@/services/telegramAuthService';

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
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
}

export function useSecureTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const authService = TelegramAuthService.getInstance();

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting enhanced Telegram authentication...');
    
    try {
      const inTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      const authResult = await authService.authenticateUser();
      
      if (authResult.success && authResult.user) {
        console.log('✅ Authentication successful:', authResult.user.first_name);
        
        updateState({
          user: authResult.user,
          isAuthenticated: true,
          isLoading: false,
          error: authResult.error || null
        });
      } else {
        console.error('❌ Authentication failed:', authResult.error);
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: authResult.error || 'Authentication failed'
        });
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication timeout - please refresh the app'
        });
        initializedRef.current = true;
      }
    }, 5000);

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
