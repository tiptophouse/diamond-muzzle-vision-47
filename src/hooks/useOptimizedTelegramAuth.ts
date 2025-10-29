import { useState, useEffect, useRef, useCallback } from 'react';
import { TelegramUser } from '@/types/telegram';
import { signInToBackend, clearBackendAuthToken } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';
import { tokenManager } from '@/lib/api/tokenManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractTelegramUser } from '@/lib/api/validation';

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
    // Try to restore from cache for instant load - but verify Telegram environment
    const cachedAuth = tokenManager.getCachedAuthState();
    if (cachedAuth && tokenManager.isValid()) {
      // Verify we still have valid Telegram environment with initData
      if (!window.Telegram?.WebApp?.initData) {
        console.warn('⚠️ AUTH: Cached auth exists but no initData - clearing cache');
        tokenManager.clear();
        return {
          user: null,
          isLoading: true,
          error: null,
          isTelegramEnvironment: false,
          isAuthenticated: false,
          accessDeniedReason: null,
          loadTime: 0
        };
      }
      
      console.log('⚡ AUTH: Instant load from cache with valid initData');
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
  const maxRetries = 2; // OPTIMIZED: Reduced from 3 to 2 for faster loading

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

    const delay = Math.min(500 * Math.pow(1.5, attempt), 2000);
    if (attempt > 0) {
      console.log(`🔄 AUTH: Retry attempt ${attempt} after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      // CRITICAL: Dev mode ONLY works on localhost (NOT on production lovable.app)
      const isPreviewMode = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.endsWith('.local');
      const urlParams = new URLSearchParams(window.location.search);
      const testUserId = urlParams.get('test_user_id') || urlParams.get('user_id');
      
      // DEVELOPMENT MODE: Allow bypass for testing (localhost only)
      if (isPreviewMode && testUserId) {
        console.log('🔧 DEV MODE: Using test user ID:', testUserId);
        const mockUser: TelegramUser = {
          id: parseInt(testUserId),
          first_name: `User ${testUserId}`,
          last_name: 'Test',
          language_code: 'en'
        };
        
        setCurrentUserId(mockUser.id);
        
        updateState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          accessDeniedReason: null,
          isTelegramEnvironment: true
        });
        
        return;
      }
      
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

      // STRICT initData validation - must have minimum length and required fields
      if (!tg.initData || tg.initData.length < 50) {
        console.error('❌ AUTH: Invalid or missing Telegram initData');
        throw new Error('no_init_data');
      }

      // Validate initData structure contains required Telegram fields
      const initDataParams = new URLSearchParams(tg.initData);
      if (!initDataParams.get('user') || !initDataParams.get('hash') || !initDataParams.get('auth_date')) {
        console.error('❌ AUTH: Telegram initData missing required fields (user, hash, auth_date)');
        throw new Error('invalid_init_data');
      }

      console.log('🚀 AUTH: Fast authentication starting...');
      
      // Clear any stale tokens
      clearBackendAuthToken();
      
      // Authenticate with backend
      const jwtToken = await signInToBackend(tg.initData);
      
      if (!jwtToken) {
        throw new Error('backend_auth_failed');
      }

      // Extract and validate user data using centralized validation
      const userData = extractTelegramUser(tg.initData);
      if (!userData) {
        throw new Error('invalid_user_data');
      }

      tokenManager.setToken(jwtToken, userData.id);
      setCurrentUserId(userData.id);
      
      // Set telegram_id in Supabase session context for RLS
      try {
        await supabase.rpc('set_session_context', {
          key: 'app.current_user_id',
          value: userData.id.toString()
        });
        console.log('✅ AUTH: Set Supabase session context for RLS');
      } catch (error) {
        console.warn('⚠️ AUTH: Failed to set session context, continuing without it:', error);
        // Don't throw - this is not critical for basic functionality
      }
      
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
        'invalid_init_data': 'Invalid Telegram authentication data',
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
    }, 8000); // OPTIMIZED: Reduced from 10 seconds to 8 seconds

    // Start authentication with minimal delay
    const initTimer = setTimeout(() => authenticateWithBackoff(), 25); // OPTIMIZED: Reduced from 50ms to 25ms

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, [authenticateWithBackoff, state.isAuthenticated, updateState]);

  return state;
}