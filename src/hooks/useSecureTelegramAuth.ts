
import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { verifyTelegramUser } from '@/lib/api/auth';
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
    console.log('🔐 Starting secure Telegram authentication (attempt', authAttempts.current, ')');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      // Only allow admin access in development environment with proper validation
      if (process.env.NODE_ENV === 'development' && !inTelegram) {
        console.log('🔧 Development mode detected - allowing admin access');
        const adminUser = createAdminUser();
        
        logSecurityEvent('Development Admin Access', {
          environment: process.env.NODE_ENV,
          telegramEnv: inTelegram,
          userId: adminUser.id
        });
        
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        initializedRef.current = true;
        return;
      }

      // Initialize Telegram WebApp with timeout
      let tg = null;
      try {
        const initPromise = initializeTelegramWebApp();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WebApp init timeout')), 2000)
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
        console.error('❌ Telegram WebApp not available - authentication failed');
        
        logSecurityEvent('Authentication Failed', {
          reason: 'WebApp not available',
          environment: inTelegram ? 'telegram' : 'browser'
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Telegram WebApp not available. Please open this app through Telegram.'
        });
        initializedRef.current = true;
        return;
      }

      console.log('📱 Telegram WebApp analysis:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user,
        authMetrics: getAuthenticationMetrics()
      });

      let authenticatedUser: TelegramUser | null = null;

      // Priority 1: Try real initData with proper HMAC-SHA256 validation
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔍 Processing initData with proper HMAC-SHA256 validation...');
        
        try {
          // Enhanced client-side validation (basic checks)
          const isValidClient = validateTelegramInitData(tg.initData);
          if (!isValidClient) {
            console.warn('⚠️ Client-side validation failed');
            logSecurityEvent('Client Validation Failed', {
              initDataLength: tg.initData.length
            });
          } else {
            // Server-side verification with proper HMAC-SHA256
            const verificationResult = await verifyTelegramUser(tg.initData);
            
            if (verificationResult && verificationResult.success) {
              console.log('✅ Proper HMAC-SHA256 verification successful');
              authenticatedUser = {
                id: verificationResult.user_id,
                first_name: verificationResult.user_data?.first_name || 'User',
                last_name: verificationResult.user_data?.last_name,
                username: verificationResult.user_data?.username,
                language_code: verificationResult.user_data?.language_code || 'en',
                is_premium: verificationResult.user_data?.is_premium,
                photo_url: verificationResult.user_data?.photo_url
              };
              
              logSecurityEvent('HMAC Verification Success', {
                userId: verificationResult.user_id,
                securityInfo: verificationResult.security_info
              });
            } else {
              console.warn('❌ HMAC-SHA256 verification failed');
              logSecurityEvent('HMAC Verification Failed', {
                result: verificationResult
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ InitData processing failed:', error);
          logSecurityEvent('InitData Processing Error', {
            error: error instanceof Error ? error.message : 'Unknown'
          });
        }
      }

      // Priority 2: Fallback to initDataUnsafe only for admin user or in development
      if (!authenticatedUser && tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        console.log('🔍 Checking initDataUnsafe as fallback:', unsafeUser.id);
        
        // Only allow admin user or development environment
        if (unsafeUser.id === ADMIN_TELEGRAM_ID || process.env.NODE_ENV === 'development') {
          console.log('✅ Admin user or development - allowing initDataUnsafe');
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name || (unsafeUser.id === ADMIN_TELEGRAM_ID ? 'Admin' : 'User'),
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
          
          logSecurityEvent('Unsafe Data Fallback', {
            userId: unsafeUser.id,
            reason: unsafeUser.id === ADMIN_TELEGRAM_ID ? 'admin_user' : 'development'
          });
        } else {
          console.warn('❌ Non-admin user with failed HMAC validation - access denied');
          logSecurityEvent('Access Denied', {
            userId: unsafeUser.id,
            reason: 'failed_hmac_validation'
          });
        }
      }

      // Final result
      if (!authenticatedUser) {
        console.error('❌ Authentication failed - no valid user found');
        
        logSecurityEvent('Authentication Failed', {
          reason: 'No valid user found',
          hasInitData: !!tg.initData,
          hasUnsafeData: !!tg.initDataUnsafe
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed. Please ensure you are opening this app through Telegram.'
        });
      } else {
        console.log('✅ Authentication successful:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);

        updateState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      logSecurityEvent('Authentication Error', {
        error: error instanceof Error ? error.message : 'Unknown',
        attempt: authAttempts.current
      });
      
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication error occurred. Please try again.'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Shorter timeout for better UX with proper security
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        
        logSecurityEvent('Authentication Timeout', {
          attempts: authAttempts.current,
          maxAttempts: maxAuthAttempts
        });
        
        // In production, don't fall back to admin on timeout
        if (process.env.NODE_ENV === 'development') {
          const adminUser = createAdminUser();
          updateState({
            user: adminUser,
            isAuthenticated: true,
            isLoading: false,
            error: 'Authentication timeout - using admin access (development only)'
          });
        } else {
          updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication timeout. Please refresh and try again.'
          });
        }
        initializedRef.current = true;
      }
    }, 3000); // 3 seconds for proper initialization

    // Start enhanced authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
