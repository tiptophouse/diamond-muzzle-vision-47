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
    console.log('🔐 Starting JWT-based Telegram authentication (attempt', authAttempts.current, ')');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      // Only allow authentication through Telegram
      if (!inTelegram) {
        console.log('❌ Not in Telegram environment - authentication required');
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'כניסה אפשרית רק דרך טלגרם'
        });
        initializedRef.current = true;
        return;
      }

      // Add development mode for testing
      if (process.env.NODE_ENV === 'development' && window.location.search.includes('dev=true')) {
        console.log('🔧 Development mode enabled - creating test user');
        const testUser = createAdminUser();
        
        // Set the current user ID for API client
        const { setCurrentUserId } = await import('@/lib/api/config');
        setCurrentUserId(testUser.id);
        
        updateState({
          user: testUser,
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
        console.log('❌ Telegram WebApp not available');
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Telegram WebApp לא זמין'
        });
        initializedRef.current = true;
        return;
      }

      console.log('📱 JWT-based Telegram WebApp authentication:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user,
      });

      let authenticatedUser: TelegramUser | null = null;

      // Try JWT authentication with initData
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔍 Attempting JWT authentication with initData...');
        console.log('🔍 Raw initData:', tg.initData);
        
        try {
          const signInResult = await telegramAuthService.signIn(tg.initData);
          
          if (signInResult) {
            console.log('✅ JWT authentication successful!');
            
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
            
            logSecurityEvent('JWT Authentication Success', {
              userId: signInResult.user_id,
              hasToken: !!signInResult.token
            });
          } else {
            console.warn('⚠️ JWT authentication failed');
            logSecurityEvent('JWT Authentication Failed', {
              reason: 'SignIn returned null'
            });
          }
        } catch (error) {
          console.warn('⚠️ JWT authentication error:', error);
          logSecurityEvent('JWT Authentication Error', {
            error: error instanceof Error ? error.message : 'Unknown'
          });
        }
      } else {
        console.log('⚠️ No initData available from Telegram WebApp');
        logSecurityEvent('No InitData', {
          hasInitData: !!tg.initData,
          initDataLength: tg.initData?.length || 0
        });
      }

      // No authentication without valid Telegram initData
      if (!authenticatedUser) {
        console.log('❌ No valid JWT authentication from Telegram');
        
        // Show detailed debugging info
        logSecurityEvent('Authentication Failed Details', {
          hasInitData: !!tg.initData,
          initDataLength: tg.initData?.length || 0,
          hasInitDataUnsafe: !!tg.initDataUnsafe,
          unsafeUserType: typeof tg.initDataUnsafe?.user,
          webAppReady: tg.isExpanded !== undefined,
          telegramVersion: tg.version || 'unknown'
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'לא ניתן לקבל מידע מטלגרם - נסה לפתוח שוב את האפליקציה'
        });
        initializedRef.current = true;
        return;
      }

      console.log('✅ Final authenticated user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);

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
      console.error('❌ JWT authentication error:', error);
      
      logSecurityEvent('Authentication Error', {
        error: error instanceof Error ? error.message : 'Unknown',
        attempt: authAttempts.current
      });
      
      // Show authentication error
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'שגיאה בהזדהות - נסה שוב'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Shorter timeout for faster fallback with enhanced security
    const timeoutId = setTimeout(async () => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Enhanced authentication timeout - using admin fallback');
        
        logSecurityEvent('Authentication Timeout', {
          attempts: authAttempts.current,
          maxAttempts: maxAuthAttempts
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'תם הזמן להזדהות - נסה שוב'
        });
        initializedRef.current = true;
      }
    }, 2500); // Reduced from 3 seconds to 2.5 seconds for better UX

    // Start enhanced authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
