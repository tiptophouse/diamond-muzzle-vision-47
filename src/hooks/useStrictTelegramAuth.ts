
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { signInToBackend } from '@/lib/api/auth';

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

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting STRICT Telegram-only authentication...');
    
    try {
      // Check for Telegram WebApp environment
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.error('❌ Not in Telegram WebApp environment - access denied');
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

      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization warning:', error);
      }

      // Check for initData - REQUIRED
      if (!tg.initData || tg.initData.length === 0) {
        console.error('❌ No Telegram initData found - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'no_init_data',
          error: 'No Telegram authentication data found'
        });
        return;
      }

      console.log('🔍 Found Telegram initData, length:', tg.initData.length);

      // Step 1: Sign in to FastAPI backend using initData
      console.log('🔐 Signing in to FastAPI backend...');
      const jwtToken = await signInToBackend(tg.initData);
      
      if (!jwtToken) {
        console.error('❌ Backend sign-in failed - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'backend_auth_failed',
          error: 'Failed to authenticate with backend'
        });
        return;
      }

      console.log('✅ JWT token received from backend');

      // Step 2: Extract user data from initDataUnsafe (if available)
      let authenticatedUser: TelegramUser | null = null;

      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        if (unsafeUser.id && unsafeUser.first_name) {
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url,
            phone_number: (unsafeUser as any).phone_number
          };
          console.log('✅ User data extracted from initDataUnsafe');
        }
      }

      // If no user data from initDataUnsafe, try parsing initData
      if (!authenticatedUser && tg.initData) {
        try {
          const urlParams = new URLSearchParams(tg.initData);
          const userParam = urlParams.get('user');
          
          if (userParam) {
            const user = JSON.parse(decodeURIComponent(userParam));
            if (user.id && user.first_name) {
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
              console.log('✅ User data parsed from initData');
            }
          }
        } catch (error) {
          console.error('❌ Failed to parse user data from initData:', error);
        }
      }

      // If still no user data, authentication failed
      if (!authenticatedUser) {
        console.error('❌ No user data found in Telegram initData - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'no_user_data',
          error: 'No user data found in Telegram authentication'
        });
        return;
      }

      // Success - user authenticated via Telegram + JWT
      console.log('✅ Authentication successful for user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessDeniedReason: null
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        isLoading: false,
        accessDeniedReason: 'system_error',
        error: error instanceof Error ? error.message : 'Authentication system error'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for authentication (5 seconds)
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.error('❌ Authentication timeout - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please reload the app'
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
