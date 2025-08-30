
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { verifyTelegramUser, signInToBackend } from '@/lib/api/auth';

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
    if (typeof window === 'undefined') {
      console.log('❌ Server-side environment - blocking access');
      return false;
    }
    
    // STRICT: Block web browser access - only allow Telegram WebApp
    const userAgent = navigator.userAgent;
    const isWebBrowser = !userAgent.includes('TelegramBot') && 
                        !userAgent.includes('Telegram') &&
                        !window.location.href.includes('tgWebAppData');
    
    if (isWebBrowser && !window.Telegram?.WebApp) {
      console.log('❌ Web browser detected without Telegram WebApp - blocking access');
      return false;
    }

    // Check for Telegram WebApp object
    if (!window.Telegram?.WebApp) {
      console.log('❌ No Telegram WebApp object found - blocking access');
      return false;
    }

    const tg = window.Telegram.WebApp;
    
    // CRITICAL: Check for initData - genuine Telegram apps will have this
    if (!tg.initData || tg.initData.length === 0) {
      console.log('❌ No initData found - not a genuine Telegram app - blocking access');
      return false;
    }

    // Validate initData structure
    try {
      const urlParams = new URLSearchParams(tg.initData);
      const userParam = urlParams.get('user');
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      
      if (!userParam || !authDate || !hash) {
        console.log('❌ Invalid initData structure - blocking access');
        return false;
      }
    } catch (error) {
      console.log('❌ Failed to parse initData - blocking access');
      return false;
    }

    // Check for platform info (block unknown platforms)
    const platform = (tg as any).platform;
    if (platform && platform === 'unknown') {
      console.log('❌ Unknown platform - likely not genuine Telegram - blocking access');
      return false;
    }

    // Additional security: check for Telegram-specific properties
    if (typeof tg.ready !== 'function' || typeof tg.expand !== 'function') {
      console.log('❌ Missing Telegram WebApp methods - blocking access');
      return false;
    }

    // Check if running in iframe (Telegram WebApps run in iframes)
    if (window.self === window.top) {
      console.log('❌ Not running in iframe - likely not genuine Telegram - blocking access');
      return false;
    }

    console.log('✅ Genuine Telegram environment verified');
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
      
      // STRICT: Check timestamp validity (within 2 minutes for maximum security)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 2 * 60 * 1000; // 2 minutes only
      
      if (now - authDateTime > maxAge) {
        console.log('❌ Telegram data too old - possible replay attack');
        return false;
      }
      
      // Parse and validate user data
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

    console.log('🔐 Starting STRICT Telegram-only authentication...');
    
    try {
      // STEP 1: Verify genuine Telegram environment
      const isGenuineTelegram = isGenuineTelegramEnvironment();

      updateState({ isTelegramEnvironment: isGenuineTelegram });

      // BLOCK: If not genuine Telegram, deny access immediately
      if (!isGenuineTelegram) {
        console.log('🚫 ACCESS DENIED: Not a genuine Telegram environment');
        updateState({
          isLoading: false,
          accessDeniedReason: 'not_telegram',
          error: 'Access denied: Telegram Mini App only'
        });
        return;
      }

      const tg = window.Telegram!.WebApp;

      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization warning:', error);
      }

      console.log('🔍 InitData available:', !!tg.initData);
      console.log('🔍 InitData length:', tg.initData?.length || 0);

      // STEP 2: Validate initData
      if (!tg.initData || !validateTelegramData(tg.initData)) {
        console.log('🚫 ACCESS DENIED: Invalid or missing Telegram initData');
        updateState({
          isLoading: false,
          accessDeniedReason: 'invalid_telegram_data',
          error: 'Access denied: Invalid Telegram data'
        });
        return;
      }

      // STEP 3: Sign in to FastAPI backend to get JWT
      console.log('🔐 Signing in to FastAPI backend with Telegram initData...');
      const jwtToken = await signInToBackend(tg.initData);
      
      if (!jwtToken) {
        console.log('🚫 ACCESS DENIED: FastAPI authentication failed');
        updateState({
          isLoading: false,
          accessDeniedReason: 'authentication_failed',
          error: 'Access denied: Authentication failed'
        });
        return;
      }

      console.log('✅ FastAPI JWT authentication successful');

      // STEP 4: Verify with backend using JWT
      const verificationResult = await verifyTelegramUser(tg.initData);
      
      if (!verificationResult || !verificationResult.success) {
        console.log('🚫 ACCESS DENIED: Backend verification failed');
        updateState({
          isLoading: false,
          accessDeniedReason: 'authentication_failed',
          error: 'Access denied: Verification failed'
        });
        return;
      }

      // STEP 5: Create authenticated user
      const authenticatedUser: TelegramUser = {
        id: verificationResult.user_id,
        first_name: verificationResult.user_data?.first_name || 'User',
        last_name: verificationResult.user_data?.last_name,
        username: verificationResult.user_data?.username,
        language_code: verificationResult.user_data?.language_code || 'en',
        is_premium: verificationResult.user_data?.is_premium,
        photo_url: verificationResult.user_data?.photo_url,
        phone_number: verificationResult.user_data?.phone_number
      };

      console.log('✅ STRICT TELEGRAM AUTHENTICATION SUCCESSFUL');
      console.log('👤 Authenticated user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);

      // SUCCESS: Grant access
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
    
    // Timeout for authentication (shorter for security)
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout - blocking access');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout'
        });
        initializedRef.current = true;
      }
    }, 3000); // 3 seconds max

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
