
import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api/auth';

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

    console.log('🔐 Starting Telegram initData authentication...');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      if (!inTelegram) {
        // Development fallback - only provide admin access
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - providing admin access');
          const adminUser = createAdminUser();
          
          updateState({
            user: adminUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          setCurrentUserId(adminUser.id);
          initializedRef.current = true;
          return;
        } else {
          // Production without Telegram environment
          console.log('❌ Production requires Telegram environment');
          updateState({
            isLoading: false,
            error: 'This app must be accessed through Telegram'
          });
          initializedRef.current = true;
          return;
        }
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
        updateState({
          isLoading: false,
          error: 'Failed to initialize Telegram WebApp'
        });
        initializedRef.current = true;
        return;
      }

      if (!tg) {
        console.log('❌ Telegram WebApp not available');
        updateState({
          isLoading: false,
          error: 'Telegram WebApp not available'
        });
        initializedRef.current = true;
        return;
      }

      console.log('📱 Telegram WebApp available:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user
      });

      let authenticatedUser: TelegramUser | null = null;

      // Priority 1: Use real initData for backend verification
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔍 Processing real initData for backend verification...');
        
        try {
          // First validate initData client-side
          const isValid = validateTelegramInitData(tg.initData);
          if (isValid) {
            console.log('✅ InitData client-side validation passed');
            
            // Try backend verification
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
              setCurrentUserId(verificationResult.user_id);
            } else {
              console.warn('⚠️ Backend verification failed, trying client-side parsing');
              
              // Fall back to client-side parsing
              const initDataParsed = parseTelegramInitData(tg.initData);
              if (initDataParsed?.user) {
                console.log('✅ Client-side initData parsing successful');
                authenticatedUser = {
                  id: initDataParsed.user.id,
                  first_name: initDataParsed.user.first_name,
                  last_name: initDataParsed.user.last_name,
                  username: initDataParsed.user.username,
                  language_code: initDataParsed.user.language_code || 'en',
                  is_premium: initDataParsed.user.is_premium,
                  photo_url: initDataParsed.user.photo_url
                };
                setCurrentUserId(initDataParsed.user.id);
              }
            }
          } else {
            console.warn('❌ InitData client-side validation failed');
          }
        } catch (error) {
          console.warn('⚠️ InitData processing failed:', error);
        }
      }

      // Priority 2: Use initDataUnsafe only if no valid initData
      if (!authenticatedUser && tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        console.log('🔍 Using initDataUnsafe as fallback:', unsafeUser);
        
        // Only use unsafe data if it looks legitimate
        if (unsafeUser.id && unsafeUser.first_name && 
            !['Test', 'Telegram', 'Emergency'].includes(unsafeUser.first_name)) {
          console.log('✅ InitDataUnsafe appears legitimate');
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
          setCurrentUserId(unsafeUser.id);
        }
      }

      // If still no user, show error
      if (!authenticatedUser) {
        console.log('❌ No valid Telegram user data found');
        updateState({
          isLoading: false,
          error: 'No valid Telegram user data available'
        });
        initializedRef.current = true;
        return;
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
      
      updateState({
        isLoading: false,
        error: 'Authentication failed - please try again'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set a timeout for fallback
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          error: 'Authentication timeout - please refresh'
        });
        initializedRef.current = true;
      }
    }, 5000);

    // Start authentication immediately
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
