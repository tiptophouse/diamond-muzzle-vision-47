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
    // Try to restore from cache for instant load - LENIENT validation to prevent race conditions
    const cachedAuth = tokenManager.getCachedAuthState();
    if (cachedAuth && tokenManager.isValid()) {
      console.log('⚡ AUTH: Instant load from cache - trusting valid token');
      setCurrentUserId(cachedAuth.userId);
      
      // Set session context for RLS (non-blocking, fire-and-forget)
      void (async () => {
        try {
          await supabase.rpc('set_user_context', { telegram_id: cachedAuth.userId });
          console.log('✅ Set session context from cache');
        } catch (err) {
          console.warn('⚠️ Failed to set session context:', err);
        }
      })();
      
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
  const maxRetries = 3; // Allow more retries for initData race condition

  const updateState = useCallback((updates: Partial<OptimizedAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ 
        ...prev, 
        ...updates,
        loadTime: Date.now() - startTime.current
      }));
    }
  }, []);

  // Helper function to wait for initData to be available
  const waitForInitData = useCallback(async (maxWaitTime: number = 3000): Promise<string | null> => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    console.log('⏳ AUTH: Waiting for Telegram initData...');
    
    while (Date.now() - startTime < maxWaitTime) {
      if (window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 50) {
        console.log('✅ AUTH: initData is now available');
        return window.Telegram.WebApp.initData;
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.warn('⚠️ AUTH: Timeout waiting for initData');
    return null;
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
        
        // Set session context for RLS (non-blocking, fire-and-forget)
        void (async () => {
          try {
            await supabase.rpc('set_user_context', { telegram_id: mockUser.id });
            console.log('✅ Set session context in dev mode');
          } catch (err) {
            console.warn('⚠️ Failed to set session context:', err);
          }
        })();
        
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
      
      // CRITICAL: Log full Telegram environment details
      console.log('🔍 TELEGRAM ENV CHECK:', {
        href: window.location.href,
        hasTelegram: !!window.Telegram,
        hasWebApp: !!window.Telegram?.WebApp,
        initDataLength: window.Telegram?.WebApp?.initData?.length || 0,
        initDataPresent: !!window.Telegram?.WebApp?.initData,
        userIdFromInitData: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null
      });
      
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

      // Wait for initData to be populated (with timeout)
      const initData = await waitForInitData(3000);
      
      // STRICT initData validation - must have minimum length and required fields
      if (!initData || initData.length < 50) {
        console.error('❌ AUTH: Invalid or missing Telegram initData after wait');
        throw new Error('no_init_data');
      }

      // Validate initData structure contains required Telegram fields
      const initDataParams = new URLSearchParams(initData);
      if (!initDataParams.get('user') || !initDataParams.get('hash') || !initDataParams.get('auth_date')) {
        console.error('❌ AUTH: Telegram initData missing required fields (user, hash, auth_date)');
        throw new Error('invalid_init_data');
      }

      console.log('🚀 AUTH: Fast authentication starting...');
      
      // Clear any stale tokens
      clearBackendAuthToken();
      
      // Authenticate with backend using the waited-for initData
      const jwtToken = await signInToBackend(initData);
      
      if (!jwtToken) {
        throw new Error('backend_auth_failed');
      }

      // Extract and validate user data using centralized validation
      const userData = extractTelegramUser(initData);
      if (!userData) {
        throw new Error('invalid_user_data');
      }

      tokenManager.setToken(jwtToken, userData.id);
      setCurrentUserId(userData.id);
      
      // Set telegram_id in Supabase session context for RLS
      try {
        await supabase.rpc('set_user_context', {
          telegram_id: userData.id
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
      
      // Special handling for no_init_data - this is often a timing issue
      if (errorType === 'no_init_data' && retryCount.current < maxRetries) {
        console.log(`🔄 AUTH: Retrying for initData availability (${retryCount.current}/${maxRetries})`);
        return authenticateWithBackoff(retryCount.current);
      }
      
      // Regular retry logic for other errors (except not_telegram_environment)
      if (retryCount.current < maxRetries && errorType !== 'not_telegram_environment') {
        console.log(`🔄 AUTH: Retrying (${retryCount.current}/${maxRetries})`);
        return authenticateWithBackoff(retryCount.current);
      }

      console.error('❌ AUTH: Authentication failed after max retries:', errorType);
      
      const errorMessages = {
        'not_telegram_environment': 'This app only works inside Telegram WebApp',
        'no_init_data': 'Cannot access Telegram initData. Please open this app from Telegram.',
        'invalid_init_data': 'Invalid Telegram authentication data',
        'backend_auth_failed': 'Backend authentication failed',
        'invalid_user_data': 'Invalid user data',
        'system_error': 'System authentication error'
      };

      const errorMessage = errorMessages[errorType as keyof typeof errorMessages] || 'Authentication failed';
      
      // BLOCKING ERROR: Show full-screen red banner for missing initData/Telegram env
      if (errorType === 'not_telegram_environment' || errorType === 'no_init_data' || errorType === 'invalid_init_data') {
        console.error('🚨 BLOCKING AUTH ERROR:', { errorType, errorMessage });
        
        // Show blocking toast
        toast.error(errorMessage, {
          duration: Infinity,
          description: 'This app must be opened from Telegram Mini App. Please close and reopen from Telegram.',
        });
        
        // Update state to trigger blocking UI in parent component
        updateState({
          isLoading: false,
          error: errorMessage,
          accessDeniedReason: errorType,
          isTelegramEnvironment: errorType !== 'not_telegram_environment'
        });
        return;
      }
      
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