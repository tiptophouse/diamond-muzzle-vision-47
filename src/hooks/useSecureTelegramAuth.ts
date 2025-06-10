
import { useState, useEffect, useRef } from 'react';
import { isTelegramWebAppEnvironment } from '@/utils/telegramWebApp';
import { authenticateWithTelegramData } from '@/utils/authUtils';
import { AuthState } from '@/types/auth';

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

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      updateState({ isTelegramEnvironment: inTelegram });

      // Authenticate user
      const authenticatedUser = await authenticateWithTelegramData();

      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed - please try again'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set a timeout for fallback
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          error: 'Authentication timeout - please refresh'
        });
        initializedRef.current = true;
      }
    }, 5000);

    // Start authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
