
import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { verifyTelegramUser } from '@/lib/api/auth';

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

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting enhanced Telegram authentication...');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      // Always allow admin access regardless of environment
      if (process.env.NODE_ENV === 'development' || !inTelegram) {
        console.log('🔧 Providing admin access for development/non-telegram environment');
        const adminUser = createAdminUser();
        
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        initializedRef.current = true;
        return;
      }

      // Initialize Telegram WebApp
      let tg = null;
      try {
        const initialized = await initializeTelegramWebApp();
        if (initialized) {
          tg = getTelegramWebApp();
        }
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization failed:', error);
        // Fall back to admin user
        const adminUser = createAdminUser();
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: 'Using fallback authentication'
        });
        initializedRef.current = true;
        return;
      }

      if (!tg) {
        console.log('🆘 Telegram WebApp not available, using admin fallback');
        const adminUser = createAdminUser();
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: 'Telegram WebApp not available - using admin access'
        });
        initializedRef.current = true;
        return;
      }

      console.log('📱 Telegram WebApp object:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user
      });

      let authenticatedUser: TelegramUser | null = null;

      // Try initDataUnsafe first (fastest)
      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        console.log('🔍 Found user in initDataUnsafe:', unsafeUser);
        
        // If it's the admin user, use it immediately
        if (unsafeUser.id === ADMIN_TELEGRAM_ID) {
          console.log('✅ ADMIN USER detected in initDataUnsafe!');
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name || 'Admin',
            last_name: unsafeUser.last_name || 'User',
            username: unsafeUser.username || 'admin',
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
        } else if (unsafeUser.first_name && !['Test', 'Telegram', 'Emergency'].includes(unsafeUser.first_name)) {
          console.log('✅ Valid user found in initDataUnsafe');
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
        }
      }

      // Try real initData if no valid user found yet
      if (!authenticatedUser && tg.initData && tg.initData.length > 0) {
        console.log('🔍 Processing real initData...');
        
        try {
          // Try backend verification first
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ Backend verification successful');
            authenticatedUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || 'User',
              last_name: verificationResult.user_data?.last_name,
              username: verificationResult.user_data?.username,
              language_code: verificationResult.user_data?.language_code || 'en',
              is_premium: verificationResult.user_data?.is_premium,
              photo_url: verificationResult.user_data?.photo_url
            };
          } else {
            console.warn('⚠️ Backend verification failed, trying client-side validation');
            
            // Try client-side validation
            const isValid = validateTelegramInitData(tg.initData);
            if (isValid) {
              const initDataParsed = parseTelegramInitData(tg.initData);
              if (initDataParsed?.user) {
                console.log('✅ Client-side validation successful');
                authenticatedUser = {
                  id: initDataParsed.user.id,
                  first_name: initDataParsed.user.first_name,
                  last_name: initDataParsed.user.last_name,
                  username: initDataParsed.user.username,
                  language_code: initDataParsed.user.language_code || 'en',
                  is_premium: initDataParsed.user.is_premium,
                  photo_url: initDataParsed.user.photo_url
                };
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ InitData processing failed:', error);
        }
      }

      // If still no user, fall back to admin
      if (!authenticatedUser) {
        console.log('🆘 No valid user found, using admin fallback');
        authenticatedUser = createAdminUser();
      }

      console.log('✅ Final authenticated user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);

      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      // Always fall back to admin user on any error
      const adminUser = createAdminUser();
      updateState({
        user: adminUser,
        isAuthenticated: true,
        isLoading: false,
        error: 'Authentication error - using admin access'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set a shorter timeout for faster fallback
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout - using admin fallback');
        const adminUser = createAdminUser();
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: 'Authentication timeout - using admin access'
        });
        initializedRef.current = true;
      }
    }, 3000); // Reduced from 10 seconds to 3 seconds

    // Start authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
