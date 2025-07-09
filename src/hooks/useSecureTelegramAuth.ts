
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
import { secureLog } from '@/utils/secureLogging';

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
    secureLog.security(`Security Event: ${event}`, {
      ...details,
      attempt: authAttempts.current
    });
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current || authAttempts.current >= maxAuthAttempts) {
      return;
    }

    authAttempts.current++;
    secureLog.debug('Starting enhanced secure Telegram authentication', { attempt: authAttempts.current });
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      secureLog.debug('Telegram environment check', { inTelegram });
      
      updateState({ isTelegramEnvironment: inTelegram });

      // Only allow admin access in development, not for every error
      if (process.env.NODE_ENV === 'development' && !inTelegram) {
        secureLog.warn('Providing admin access for development environment only');
        const adminUser = createAdminUser();
        
        logSecurityEvent('Development Admin Access', {
          environment: process.env.NODE_ENV,
          telegramEnv: inTelegram
        });
        
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: 'Development mode - not in Telegram'
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
        secureLog.error('Telegram WebApp not available');
        
        logSecurityEvent('WebApp Unavailable', {
          reason: 'WebApp not available'
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Telegram WebApp not available'
        });
        initializedRef.current = true;
        return;
      }

      secureLog.debug('Telegram WebApp analysis', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        hasUnsafeUser: !!tg.initDataUnsafe?.user,
        authMetrics: getAuthenticationMetrics()
      });

      let authenticatedUser: TelegramUser | null = null;

      // Priority 1: Try initDataUnsafe first for admin or valid users
      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        secureLog.debug('Analyzing user from initDataUnsafe', { hasUserId: !!unsafeUser.id });
        
        // If it's the admin user, use it immediately
        if (unsafeUser.id === ADMIN_TELEGRAM_ID) {
          secureLog.info('Admin user detected in initDataUnsafe');
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name || 'Admin',
            last_name: unsafeUser.last_name || 'User',
            username: unsafeUser.username || 'admin',
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
          
          logSecurityEvent('Admin User Detected', {
            source: 'initDataUnsafe'
          });
        } else if (unsafeUser.first_name && !['Test', 'Telegram', 'Emergency'].includes(unsafeUser.first_name)) {
          secureLog.info('Valid user found in initDataUnsafe');
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
          
          logSecurityEvent('Valid User Detected', {
            source: 'initDataUnsafe'
          });
        }
      }

      // Priority 2: Try real initData with enhanced validation if no user found yet
      if (!authenticatedUser && tg.initData && tg.initData.length > 0) {
        console.log('🔍 Processing real initData with enhanced security...');
        
        try {
          // Enhanced client-side validation
          const isValidClient = validateTelegramInitData(tg.initData);
          if (!isValidClient) {
            console.warn('⚠️ Client-side validation failed');
            logSecurityEvent('Client Validation Failed', {
              initDataLength: tg.initData.length
            });
          } else {
            // Try backend verification
            const verificationResult = await verifyTelegramUser(tg.initData);
            
            if (verificationResult && verificationResult.success) {
              console.log('✅ Enhanced backend verification successful');
              authenticatedUser = {
                id: verificationResult.user_id,
                first_name: verificationResult.user_data?.first_name || 'User',
                last_name: verificationResult.user_data?.last_name,
                username: verificationResult.user_data?.username,
                language_code: verificationResult.user_data?.language_code || 'en',
                is_premium: verificationResult.user_data?.is_premium,
                photo_url: verificationResult.user_data?.photo_url
              };
              
              logSecurityEvent('Backend Verification Success', {
                userId: verificationResult.user_id,
                securityInfo: verificationResult.security_info
              });
            } else {
              console.warn('⚠️ Enhanced backend verification failed');
              logSecurityEvent('Backend Verification Failed', {
                result: verificationResult
              });
              
              // Try client-side parsing as fallback
              const initDataParsed = parseTelegramInitData(tg.initData);
              if (initDataParsed?.user) {
                console.log('✅ Client-side parsing successful as fallback');
                authenticatedUser = {
                  id: initDataParsed.user.id,
                  first_name: initDataParsed.user.first_name,
                  last_name: initDataParsed.user.last_name,
                  username: initDataParsed.user.username,
                  language_code: initDataParsed.user.language_code || 'en',
                  is_premium: initDataParsed.user.is_premium,
                  photo_url: initDataParsed.user.photo_url
                };
                
                logSecurityEvent('Client Parsing Fallback', {
                  userId: initDataParsed.user.id
                });
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ InitData processing failed:', error);
          logSecurityEvent('InitData Processing Error', {
            error: error instanceof Error ? error.message : 'Unknown'
          });
        }
      }

      // If still no user and in production, fail securely
      if (!authenticatedUser) {
        if (process.env.NODE_ENV === 'production') {
          secureLog.warn('No valid user found in production - denying access');
          logSecurityEvent('Authentication Failed', {
            reason: 'No valid user found'
          });
          
          updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication failed'
          });
          initializedRef.current = true;
          return;
        } else {
          // Only fallback to admin in development
          secureLog.warn('No valid user found in development - using admin fallback');
          authenticatedUser = createAdminUser();
          
          logSecurityEvent('Development Admin Fallback', {
            reason: 'No valid user found'
          });
        }
      }

      if (authenticatedUser) {
        secureLog.info('Authentication successful');
      }

      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      secureLog.error('Authentication error', { 
        error: error instanceof Error ? error.message : 'Unknown',
        attempt: authAttempts.current
      });
      
      logSecurityEvent('Authentication Error', {
        error: error instanceof Error ? error.message : 'Unknown',
        attempt: authAttempts.current
      });
      
      // Secure failure - only fallback to admin in development
      if (process.env.NODE_ENV === 'development') {
        const adminUser = createAdminUser();
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: 'Authentication error - using development admin access'
        });
      } else {
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed'
        });
      }
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Shorter timeout for faster fallback with enhanced security
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        secureLog.warn('Authentication timeout');
        
        logSecurityEvent('Authentication Timeout', {
          attempts: authAttempts.current,
          maxAttempts: maxAuthAttempts
        });
        
        // Secure timeout handling - no automatic admin access
        if (process.env.NODE_ENV === 'development') {
          const adminUser = createAdminUser();
          updateState({
            user: adminUser,
            isAuthenticated: true,
            isLoading: false,
            error: 'Authentication timeout - using development admin access'
          });
        } else {
          updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication timeout'
          });
        }
        initializedRef.current = true;
      }
    }, 2500);

    // Start enhanced authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
