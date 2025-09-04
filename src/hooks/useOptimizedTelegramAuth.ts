import { useState, useEffect, useRef, useCallback } from 'react';
import { TelegramUser } from '@/types/telegram';
import { signInToBackend, clearBackendAuthToken } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';
import { tokenManager } from '@/lib/api/tokenManager';
import { toast } from 'sonner';

interface OptimizedAuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  accessDeniedReason: string | null;
  loadTime: number;
}

export function useOptimizedTelegramAuth(): OptimizedAuthState {
  const startTime = useRef(Date.now());
  
  const [state, setState] = useState<OptimizedAuthState>(() => {
    // Try to restore from cache for instant load
    const cachedAuth = tokenManager.getCachedAuthState();
    if (cachedAuth && tokenManager.isValid()) {
      console.log('⚡ AUTH: Instant load from cache');
      setCurrentUserId(cachedAuth.userId);
      return {
        user: cachedAuth.user,
        isLoading: false,
        error: null,
        isTelegramEnvironment: true,
        isAuthenticated: true,
        accessDeniedReason: null,
        loadTime: 0
      };
    }
    
    return {
      user: null,
      isLoading: true,
      error: null,
      isTelegramEnvironment: false,
      isAuthenticated: false,
      accessDeniedReason: null,
      loadTime: 0
    };
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const updateState = useCallback((updates: Partial<OptimizedAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ 
        ...prev, 
        ...updates,
        loadTime: Date.now() - startTime.current
      }));
    }
  }, []);

  const authenticateWithBackoff = useCallback(async (attempt: number = 0): Promise<void> => {
    if (initializedRef.current || !mountedRef.current) return;

    const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
    if (attempt > 0) {
      console.log(`🔄 AUTH: Retry attempt ${attempt} after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      // Fast environment check
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        throw new Error('not_telegram_environment');
      }

      const tg = window.Telegram.WebApp;
      updateState({ isTelegramEnvironment: true });

      // Quick WebApp initialization
      try {
        tg.ready?.();
        tg.expand?.();
      } catch (e) {
        console.warn('⚠️ AUTH: WebApp init warning:', e);
      }

      // Validate initData
      if (!tg.initData?.length) {
        throw new Error('no_init_data');
      }

      console.log('🚀 AUTH: Fast authentication starting...');
      
      // Clear any stale tokens
      clearBackendAuthToken();
      
      // Authenticate with backend
      const jwtToken = await signInToBackend(tg.initData);
      
      if (!jwtToken) {
        throw new Error('backend_auth_failed');
      }

      // Store token for future use
      const userData = extractUserData(tg.initData);
      if (!userData) {
        throw new Error('invalid_user_data');
      }

      tokenManager.setToken(jwtToken, userData.id);
      setCurrentUserId(userData.id);
      
      // Cache complete auth state
      tokenManager.cacheAuthState(userData, jwtToken);

      console.log('✅ AUTH: Fast authentication complete');
      
      retryCount.current = 0;
      updateState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessDeniedReason: null
      });

    } catch (error) {
      const errorType = error instanceof Error ? error.message : 'system_error';
      
      retryCount.current++;
      if (retryCount.current < maxRetries && errorType !== 'not_telegram_environment') {
        console.log(`🔄 AUTH: Retrying (${retryCount.current}/${maxRetries})`);
        return authenticateWithBackoff(retryCount.current);
      }

      console.error('❌ AUTH: Authentication failed:', errorType);
      
      const errorMessages = {
        'not_telegram_environment': 'This app only works inside Telegram WebApp',
        'no_init_data': 'Missing Telegram authentication data',
        'backend_auth_failed': 'Backend authentication failed',
        'invalid_user_data': 'Invalid user data',
        'system_error': 'System authentication error'
      };

      const errorMessage = errorMessages[errorType as keyof typeof errorMessages] || 'Authentication failed';
      
      if (errorType !== 'not_telegram_environment') {
        toast.error(errorMessage, {
          action: {
            label: 'Retry',
            onClick: () => {
              retryCount.current = 0;
              initializedRef.current = false;
              updateState({ isLoading: true, error: null });
              setTimeout(() => authenticateWithBackoff(), 100);
            }
          }
        });
      }

      updateState({
        isLoading: false,
        error: errorMessage,
        accessDeniedReason: errorType
      });
    } finally {
      initializedRef.current = true;
    }
  }, [updateState]);

  // Extract user data efficiently
  const extractUserData = (initData: string): TelegramUser | null => {
    try {
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      
      if (!userParam) return null;
      
      const user = JSON.parse(decodeURIComponent(userParam));
      if (!user.id || !user.first_name) return null;
      
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code || 'en',
        is_premium: user.is_premium,
        photo_url: user.photo_url,
        phone_number: user.phone_number
      };
    } catch (error) {
      console.error('❌ AUTH: Failed to extract user data:', error);
      return null;
    }
  };

  // Handle token refresh events
  useEffect(() => {
    const handleTokenRefresh = async (event: CustomEvent) => {
      console.log('🔄 AUTH: Token refresh requested');
      if (window.Telegram?.WebApp?.initData) {
        try {
          const newToken = await signInToBackend(window.Telegram.WebApp.initData);
          if (newToken && state.user) {
            tokenManager.setToken(newToken, state.user.id);
            tokenManager.cacheAuthState(state.user, newToken);
            console.log('✅ AUTH: Token refreshed successfully');
          }
        } catch (error) {
          console.error('❌ AUTH: Token refresh failed:', error);
        }
      }
    };

    window.addEventListener('token-refresh-needed', handleTokenRefresh as EventListener);
    return () => window.removeEventListener('token-refresh-needed', handleTokenRefresh as EventListener);
  }, [state.user]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Skip initialization if we already have cached valid auth
    if (state.isAuthenticated && tokenManager.isValid()) {
      console.log('⚡ AUTH: Using cached authentication, skipping init');
      return;
    }
    
    // Fast timeout for better UX
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.error('❌ AUTH: Timeout reached');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please reload'
        });
        initializedRef.current = true;
      }
    }, 10000); // Reduced to 10 seconds

    // Start authentication with minimal delay
    const initTimer = setTimeout(() => authenticateWithBackoff(), 50);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [authenticateWithBackoff, state.isAuthenticated, updateState]);

  return state;
}