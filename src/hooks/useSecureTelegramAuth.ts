import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { telegramAuthService } from '@/lib/api/telegramAuth';
import { getAuthenticationMetrics } from '@/utils/telegramValidation';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
}

const ADMIN_TELEGRAM_ID = 2138564172;

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
  const authAttempts = useRef(0);
  const maxAuthAttempts = 3;

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const createAdminUser = (): TelegramUser => {
    return {
      id: ADMIN_TELEGRAM_ID,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      language_code: "en"
    };
  };

  const logSecurityEvent = (event: string, details: any) => {
    console.log(`🛡️ Security Event: ${event}`, {
      ...details,
      timestamp: new Date().toISOString(),
      attempt: authAttempts.current
    });
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current || authAttempts.current >= maxAuthAttempts) {
      return;
    }

    authAttempts.current++;
    console.log('🔐 Starting STRICT Telegram-only authentication (attempt', authAttempts.current, ')');
    
    try {
      // Check if we're in Telegram environment - STRICT MODE
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      // ⚠️ STRICT MODE: Only allow real Telegram Mini App access
      if (!inTelegram) {
        console.log('❌ STRICT: Access denied - not in Telegram environment');
        
        logSecurityEvent('Access Denied', {
          reason: 'Not in Telegram environment',
          environment: process.env.NODE_ENV
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'מערכת זו זמינה רק דרך אפליקציית טלגרם'
        });
        initializedRef.current = true;
        return;
      }

      // Initialize Telegram WebApp with timeout
      let tg = null;
      try {
        const initPromise = initializeTelegramWebApp();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WebApp init timeout')), 5000)
        );
        
        const initialized = await Promise.race([initPromise, timeoutPromise]) as boolean;
        if (initialized) {
          tg = getTelegramWebApp();
        }
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization failed:', error);
        logSecurityEvent('WebApp Init Failed', { error: error instanceof Error ? error.message : 'Unknown' });
      }

      if (!tg) {
        console.log('❌ STRICT: Telegram WebApp not available');
        
        logSecurityEvent('Access Denied', {
          reason: 'WebApp not available'
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'לא ניתן לטעון את נתוני טלגרם - נסה לרענן'
        });
        initializedRef.current = true;
        return;
      }

      console.log('📱 STRICT Telegram WebApp authentication:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user,
      });

      let authenticatedUser: TelegramUser | null = null;

      // ⚠️ STRICT MODE: Only real Telegram initData allowed
      if (!tg.initData || tg.initData.length === 0) {
        console.log('❌ STRICT: No valid initData from Telegram');
        
        logSecurityEvent('Access Denied', {
          reason: 'No valid initData'
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'נתוני אימות טלגרם לא זמינים - נסה לפתוח מחדש את האפליקציה'
        });
        initializedRef.current = true;
        return;
      }

      // Try JWT authentication with real initData only
      console.log('🔍 Attempting STRICT JWT authentication with real initData...');
      
      try {
        const signInResult = await telegramAuthService.signIn(tg.initData);
        
        if (signInResult) {
          console.log('✅ STRICT JWT authentication successful!');
          
          // Extract user info from initDataUnsafe if available
          let userData = {
            id: signInResult.user_id,
            first_name: 'User',
            last_name: '',
            username: '',
            language_code: 'en',
          };

          if (tg.initDataUnsafe?.user) {
            const unsafeUser = tg.initDataUnsafe.user;
            userData = {
              id: signInResult.user_id,
              first_name: unsafeUser.first_name || 'User',
              last_name: unsafeUser.last_name || '',
              username: unsafeUser.username || '',
              language_code: unsafeUser.language_code || 'en',
            };
          }

          authenticatedUser = userData;
          
          logSecurityEvent('STRICT JWT Authentication Success', {
            userId: signInResult.user_id,
            hasToken: !!signInResult.token,
            fromTelegram: true
          });
        } else {
          console.warn('❌ STRICT: JWT authentication failed - no token received');
          logSecurityEvent('JWT Authentication Failed', {
            reason: 'SignIn returned null'
          });
        }
      } catch (error) {
        console.warn('❌ STRICT: JWT authentication error:', error);
        logSecurityEvent('JWT Authentication Error', {
          error: error instanceof Error ? error.message : 'Unknown'
        });
      }

      // ⚠️ STRICT MODE: No fallbacks allowed
      if (!authenticatedUser) {
        console.log('❌ STRICT: Authentication failed - no fallbacks allowed');
        
        logSecurityEvent('Authentication Failed', {
          reason: 'No valid authentication method',
          strictMode: true
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'כישלון באימות דרך טלגרם - אנא נסה שוב'
        });
        initializedRef.current = true;
        return;
      }

      console.log('✅ STRICT: Final authenticated user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);

      // Set the current user ID for API client
      const { setCurrentUserId } = await import('@/lib/api/config');
      setCurrentUserId(authenticatedUser.id);

      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ STRICT: Authentication error:', error);
      
      logSecurityEvent('Authentication Error', {
        error: error instanceof Error ? error.message : 'Unknown',
        attempt: authAttempts.current,
        strictMode: true
      });
      
      // ⚠️ STRICT MODE: No admin fallback on error
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'שגיאה באימות - אנא נסה לרענן את האפליקציה'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // STRICT timeout - no fallbacks allowed
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('❌ STRICT: Authentication timeout - no fallbacks allowed');
        
        logSecurityEvent('Authentication Timeout', {
          attempts: authAttempts.current,
          maxAttempts: maxAuthAttempts,
          strictMode: true
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'תמה הזמן הקצוב לאימות - אנא נסה לפתוח את האפליקציה מחדש דרך טלגרם'
        });
        initializedRef.current = true;
      }
    }, 10000); // Longer timeout for real Telegram authentication

    // Start enhanced authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
