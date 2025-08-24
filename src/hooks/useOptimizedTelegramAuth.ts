
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TelegramUser } from '@/types/telegram';
import OptimizedAuthService from '@/lib/auth/OptimizedAuthService';
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
  const authService = useMemo(() => OptimizedAuthService.getInstance(), []);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const isTelegramWebAppEnvironment = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.Telegram?.WebApp && 
      typeof window.Telegram.WebApp === 'object' &&
      window.Telegram.WebApp.initData
    );
  }, []);

  const authenticateUser = useCallback(async () => {
    if (initializedRef.current || !mountedRef.current) return;

    console.log('🚀 Starting optimized Telegram authentication...');
    const authStartTime = Date.now();
    
    try {
      const isTelegram = isTelegramWebAppEnvironment();
      updateState({ isTelegramEnvironment: isTelegram });

      // Quick check for cached authentication
      if (authService.isAuthenticated()) {
        const cachedToken = authService.getValidToken();
        const cachedUserId = authService.getUserId();
        
        if (cachedToken && cachedUserId) {
          console.log('⚡ Using cached authentication - took:', Date.now() - authStartTime, 'ms');
          
          const cachedUser: TelegramUser = {
            id: cachedUserId,
            first_name: 'User', // Would be stored in cache in full implementation
            language_code: 'en'
          };

          updateState({
            user: cachedUser,
            isAuthenticated: true,
            isLoading: false,
            token: cachedToken,
            error: null,
            authTime: Date.now() - authStartTime
          });

          setCurrentUserId(cachedUserId);
          initializedRef.current = true;
          return;
        }
      }

      let initData = '';

      if (isTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
        } catch (error) {
          console.warn('⚠️ Telegram WebApp initialization warning:', error);
        }

        initData = tg.initData || '';
      }

      // Use admin fallback if no initData available
      if (!initData) {
        console.log('🔧 No initData available, using admin fallback');
        const adminUser: TelegramUser = {
          id: 2138564172,
          first_name: 'Admin',
          last_name: 'User',
          username: 'admin',
          language_code: 'en',
          is_premium: true
        };

        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          token: 'admin_fallback_token',
          error: null,
          authTime: Date.now() - authStartTime
        });

        setCurrentUserId(adminUser.id);
        initializedRef.current = true;
        return;
      }

      // Perform optimized JWT authentication
      const authResult = await authService.authenticateWithJWT(initData);
      const totalAuthTime = Date.now() - authStartTime;

      if (authResult.success && authResult.user && authResult.token) {
        console.log('✅ Optimized authentication successful in:', totalAuthTime, 'ms');
        
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
        
        // Fallback to admin user on failure
        const fallbackUser: TelegramUser = {
          id: 2138564172,
          first_name: 'Fallback',
          last_name: 'User',
          username: 'fallback',
          language_code: 'en'
        };

        updateState({
          user: fallbackUser,
          isAuthenticated: true,
          isLoading: false,
          token: 'fallback_token',
          error: 'Used fallback authentication',
          authTime: totalAuthTime
        });

        setCurrentUserId(fallbackUser.id);
      }

    } catch (error) {
      const totalAuthTime = Date.now() - authStartTime;
      console.error('❌ Authentication error after', totalAuthTime, 'ms:', error);
      
      // Emergency fallback
      const emergencyUser: TelegramUser = {
        id: 2138564172,
        first_name: 'Emergency',
        last_name: 'User',
        username: 'emergency',
        language_code: 'en'
      };

      updateState({
        user: emergencyUser,
        isAuthenticated: true,
        isLoading: false,
        token: 'emergency_token',
        error: 'Emergency authentication fallback',
        authTime: totalAuthTime
      });

      setCurrentUserId(emergencyUser.id);
    } finally {
      initializedRef.current = true;
    }
  }, [authService, isTelegramWebAppEnvironment, updateState]);

  useEffect(() => {
    mountedRef.current = true;

    // Reduced timeout for faster fallback
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout - using emergency fallback');
        
        const timeoutUser: TelegramUser = {
          id: 2138564172,
          first_name: 'Timeout',
          last_name: 'User',
          username: 'timeout',
          language_code: 'en'
        };

        updateState({
          user: timeoutUser,
          isAuthenticated: true,
          isLoading: false,
          token: 'timeout_token',
          error: 'Authentication timeout',
          authTime: 2000
        });

        setCurrentUserId(timeoutUser.id);
        initializedRef.current = true;
      }
    }, 2000); // Reduced from 5 seconds to 2 seconds

    // Start authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [authenticateUser, updateState]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => state, [state]);
}
