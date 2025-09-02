
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { signInToBackend, clearBackendAuthToken } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';
import { toast } from 'sonner';

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  accessDeniedReason: string | null;
}

export function useStrictTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    accessDeniedReason: null,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const retryAttempts = useRef(0);
  const maxRetries = 3;

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const handleRetry = () => {
    if (retryAttempts.current < maxRetries) {
      retryAttempts.current++;
      initializedRef.current = false;
      updateState({ 
        isLoading: true, 
        error: null, 
        accessDeniedReason: null 
      });
      setTimeout(() => authenticateUser(), 500);
    } else {
      toast.error('Maximum retry attempts reached. Please refresh the app.');
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 STRICT AUTH: Starting Telegram-only authentication flow');
    
    try {
      // Clear any existing token first
      clearBackendAuthToken();
      
      // Step 1: Check for Telegram WebApp environment
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.error('❌ STRICT AUTH: Not in Telegram WebApp environment');
        updateState({
          isLoading: false,
          isTelegramEnvironment: false,
          accessDeniedReason: 'not_telegram_environment',
          error: 'This app only works inside Telegram'
        });
        return;
      }

      const tg = window.Telegram.WebApp;
      updateState({ isTelegramEnvironment: true });

      // Step 2: Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ STRICT AUTH: Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ STRICT AUTH: WebApp initialization warning:', error);
      }

      // Step 3: PRODUCTION SAFE - Check for initData (REQUIRED, no unsafe fallback)
      if (!tg.initData || !tg.initData.length) {
        console.error('❌ STRICT AUTH: Missing Telegram initData - PRODUCTION SAFE CHECK');
        
        toast.error('Authentication data missing. Please restart the app from Telegram.', {
          action: {
            label: 'Retry',
            onClick: handleRetry
          }
        });
        
        updateState({
          isLoading: false,
          accessDeniedReason: 'no_init_data',
          error: 'Missing Telegram authentication data'
        });
        return;
      }

      console.log('🔍 STRICT AUTH: Found initData, length:', tg.initData.length);

      // Step 4: Authenticate with FastAPI backend using initData
      console.log('🔐 STRICT AUTH: Authenticating with FastAPI backend...');
      const jwtToken = await signInToBackend(tg.initData);
      
      if (!jwtToken) {
        console.error('❌ STRICT AUTH: FastAPI authentication failed');
        
        toast.error('Authentication failed. Please try again.', {
          action: {
            label: 'Retry',
            onClick: handleRetry
          }
        });
        
        updateState({
          isLoading: false,
          accessDeniedReason: 'backend_auth_failed',
          error: 'Failed to authenticate with backend server'
        });
        return;
      }

      console.log('✅ STRICT AUTH: JWT token received from FastAPI');

      // Step 5: Extract user data from Telegram initData (PRODUCTION SAFE - no initDataUnsafe)
      let authenticatedUser: TelegramUser | null = null;

      try {
        const urlParams = new URLSearchParams(tg.initData);
        const userParam = urlParams.get('user');
        
        if (!userParam) {
          throw new Error('No user parameter in initData');
        }
        
        const user = JSON.parse(decodeURIComponent(userParam));
        if (!user.id || !user.first_name) {
          throw new Error('Invalid user data structure');
        }
        
        authenticatedUser = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code || 'en',
          is_premium: user.is_premium,
          photo_url: user.photo_url,
          phone_number: user.phone_number
        };
        console.log('✅ STRICT AUTH: User data extracted from secure initData');
      } catch (error) {
        console.error('❌ STRICT AUTH: Failed to parse user data from initData:', error);
        
        toast.error('Invalid authentication data. Please restart from Telegram.', {
          action: {
            label: 'Retry',
            onClick: handleRetry
          }
        });
        
        updateState({
          isLoading: false,
          accessDeniedReason: 'invalid_user_data',
          error: 'Invalid user data in authentication'
        });
        return;
      }

      // Step 6: Final validation
      if (!authenticatedUser) {
        console.error('❌ STRICT AUTH: No user data found after parsing');
        updateState({
          isLoading: false,
          accessDeniedReason: 'no_user_data',
          error: 'No user data found in Telegram authentication'
        });
        return;
      }

      // Step 7: Success - Set user ID and complete authentication
      setCurrentUserId(authenticatedUser.id);
      
      console.log('✅ STRICT AUTH: Authentication successful');
      console.log('👤 STRICT AUTH: User:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
      
      // Reset retry counter on success
      retryAttempts.current = 0;
      
      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessDeniedReason: null
      });
      
    } catch (error) {
      console.error('❌ STRICT AUTH: Authentication error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Authentication system error';
      
      toast.error(`Authentication failed: ${errorMessage}`, {
        action: {
          label: 'Retry',
          onClick: handleRetry
        }
      });
      
      updateState({
        isLoading: false,
        accessDeniedReason: 'system_error',
        error: errorMessage
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Authentication timeout (15 seconds)
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.error('❌ STRICT AUTH: Authentication timeout');
        
        toast.error('Authentication timeout. Please refresh the app.', {
          action: {
            label: 'Retry',
            onClick: handleRetry
          }
        });
        
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please reload the app'
        });
        initializedRef.current = true;
      }
    }, 15000);

    // Start authentication
    const initTimer = setTimeout(() => {
      authenticateUser();
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
    };
  }, []);

  return state;
}
