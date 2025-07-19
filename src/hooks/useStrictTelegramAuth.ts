
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { verifyTelegramUser } from '@/lib/api/auth';

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

  const isGenuineTelegramEnvironment = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check for Telegram WebApp object
    if (!window.Telegram?.WebApp) {
      console.log('❌ No Telegram WebApp object found');
      return false;
    }

    const tg = window.Telegram.WebApp;
    
    // Check for initData - genuine Telegram apps will have this
    if (!tg.initData || tg.initData.length === 0) {
      console.log('❌ No initData found - not a genuine Telegram app');
      return false;
    }

    // Check for platform info (optional check)
    const platform = (tg as any).platform;
    if (platform && platform === 'unknown') {
      console.log('❌ Platform unknown - likely not genuine Telegram');
      return false;
    }

    // Check for version (optional check)
    const version = (tg as any).version;
    if (version && version === '1.0') {
      console.log('❌ Invalid version - likely not genuine Telegram');
      return false;
    }

    // Additional security: check for Telegram-specific properties
    if (typeof tg.ready !== 'function' || typeof tg.expand !== 'function') {
      console.log('❌ Missing Telegram WebApp methods');
      return false;
    }

    console.log('✅ Genuine Telegram environment detected');
    return true;
  };

  const validateTelegramData = (initData: string): boolean => {
    try {
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      
      if (!userParam || !authDate || !hash) {
        console.log('❌ Missing required Telegram data parameters');
        return false;
      }
      
      // Check timestamp validity (within 5 minutes for security)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (now - authDateTime > maxAge) {
        console.log('❌ Telegram data too old - possible replay attack');
        return false;
      }
      
      // Parse user data
      const user = JSON.parse(decodeURIComponent(userParam));
      if (!user.id || !user.first_name) {
        console.log('❌ Invalid user data in Telegram initData');
        return false;
      }
      
      console.log('✅ Telegram data validation passed');
      return true;
    } catch (error) {
      console.error('❌ Telegram data validation failed:', error);
      return false;
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting strict Telegram-only authentication...');
    
    try {
      // STRICT: Block if not in production Telegram environment
      if (process.env.NODE_ENV === 'production') {
        const isGenuineTelegram = isGenuineTelegramEnvironment();
        if (!isGenuineTelegram) {
          updateState({
            isLoading: false,
            isTelegramEnvironment: false,
            accessDeniedReason: 'web_access_blocked',
            error: 'This application can only be accessed through Telegram Mini App'
          });
          initializedRef.current = true;
          return;
        }
      }

      // Check Telegram environment
      const inTelegram = isGenuineTelegramEnvironment();
      updateState({ isTelegramEnvironment: inTelegram });

      if (!inTelegram) {
        updateState({
          isLoading: false,
          accessDeniedReason: 'not_telegram',
          error: 'Access denied: This application requires Telegram Mini App'
        });
        initializedRef.current = true;
        return;
      }

      const tg = window.Telegram!.WebApp;
      
      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization warning:', error);
      }

      // Validate initData
      if (!tg.initData || !validateTelegramData(tg.initData)) {
        updateState({
          isLoading: false,
          accessDeniedReason: 'invalid_telegram_data',
          error: 'Invalid Telegram authentication data'
        });
        initializedRef.current = true;
        return;
      }

      // Try backend verification first
      let authenticatedUser: TelegramUser | null = null;
      
      try {
        const verificationResult = await verifyTelegramUser(tg.initData);
        if (verificationResult && verificationResult.success) {
          authenticatedUser = {
            id: verificationResult.user_id,
            first_name: verificationResult.user_data?.first_name || 'User',
            last_name: verificationResult.user_data?.last_name,
            username: verificationResult.user_data?.username,
            language_code: verificationResult.user_data?.language_code || 'en',
            is_premium: verificationResult.user_data?.is_premium,
            photo_url: verificationResult.user_data?.photo_url,
            phone_number: verificationResult.user_data?.phone_number
          };
          console.log('✅ Backend verification successful');
        }
      } catch (error) {
        console.warn('⚠️ Backend verification failed, trying client-side:', error);
      }

      // Fallback to client-side validation if backend fails
      if (!authenticatedUser && tg.initDataUnsafe?.user) {
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
          console.log('✅ Client-side authentication successful');
        }
      }

      if (!authenticatedUser) {
        updateState({
          isLoading: false,
          accessDeniedReason: 'authentication_failed',
          error: 'Failed to authenticate Telegram user'
        });
        initializedRef.current = true;
        return;
      }

      // Success
      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessDeniedReason: null
      });
      
    } catch (error) {
      console.error('❌ Strict authentication error:', error);
      updateState({
        isLoading: false,
        accessDeniedReason: 'system_error',
        error: 'Authentication system error'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please try again'
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
