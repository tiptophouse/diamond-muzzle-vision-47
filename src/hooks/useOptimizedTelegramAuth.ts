
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TelegramUser } from '@/types/telegram';
import StrictTelegramOnlyAuthService from '@/lib/auth/StrictTelegramOnlyAuthService';
import { setCurrentUserId } from '@/lib/api/config';

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  token: string | null;
  authTime?: number;
}

export function useOptimizedTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    token: null,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const authService = useMemo(() => StrictTelegramOnlyAuthService.getInstance(), []);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const isTelegramWebAppEnvironment = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    if (!window.Telegram?.WebApp) return false;
    
    const tg = window.Telegram.WebApp;
    const hasInitData = tg.initData && tg.initData.length > 0;
    const hasInitDataUnsafe = tg.initDataUnsafe && tg.initDataUnsafe.user;
    
    return hasInitData || hasInitDataUnsafe;
  }, []);

  const authenticateUser = useCallback(async () => {
    if (initializedRef.current || !mountedRef.current) return;

    console.log('🔒 Starting Telegram authentication...');
    const authStartTime = Date.now();
    
    try {
      const isTelegram = isTelegramWebAppEnvironment();
      updateState({ isTelegramEnvironment: isTelegram });

      if (!isTelegram) {
        console.error('🔒 Not in Telegram environment');
        updateState({
          isLoading: false,
          error: 'This application can only be accessed through Telegram',
          isAuthenticated: false,
          authTime: Date.now() - authStartTime
        });
        initializedRef.current = true;
        return;
      }

      // Perform authentication
      const authResult = await authService.authenticateStrictTelegramOnly();
      const totalAuthTime = Date.now() - authStartTime;

      if (authResult.success && authResult.user && authResult.token) {
        console.log('✅ Authentication successful in:', totalAuthTime, 'ms');
        
        updateState({
          user: authResult.user,
          isAuthenticated: true,
          isLoading: false,
          token: authResult.token,
          error: null,
          authTime: totalAuthTime
        });

        setCurrentUserId(authResult.user.id);
      } else {
        console.error('❌ Authentication failed:', authResult.error);
        
        updateState({
          isLoading: false,
          error: authResult.error || 'Authentication failed',
          isAuthenticated: false,
          authTime: totalAuthTime
        });
      }

    } catch (error) {
      const totalAuthTime = Date.now() - authStartTime;
      console.error('❌ Authentication error:', error);
      
      updateState({
        isLoading: false,
        error: 'Authentication system error',
        isAuthenticated: false,
        authTime: totalAuthTime
      });
    } finally {
      initializedRef.current = true;
    }
  }, [authService, isTelegramWebAppEnvironment, updateState]);

  useEffect(() => {
    mountedRef.current = true;

    // Set a reasonable timeout
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.error('🔒 Authentication timeout');
        
        updateState({
          isLoading: false,
          error: 'Authentication timeout - please try again',
          isAuthenticated: false,
          authTime: 10000
        });

        initializedRef.current = true;
      }
    }, 10000); // 10 second timeout

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [authenticateUser, updateState]);

  return useMemo(() => state, [state]);
}
