
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

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting Telegram authentication...');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      if (!inTelegram) {
        // Not in Telegram - only allow in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - providing admin access');
          const devUser: TelegramUser = {
            id: 2138564172, // Your admin ID
            first_name: "Admin",
            last_name: "Dev",
            username: "admin_dev",
            language_code: "en"
          };
          
          updateState({
            user: devUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          updateState({
            error: 'This application must be accessed through Telegram',
            isLoading: false
          });
        }
        initializedRef.current = true;
        return;
      }

      // Initialize Telegram WebApp
      const initialized = await initializeTelegramWebApp();
      if (!initialized) {
        throw new Error('Failed to initialize Telegram WebApp');
      }

      const tg = getTelegramWebApp();
      if (!tg) {
        throw new Error('Telegram WebApp not available');
      }

      console.log('📱 Telegram WebApp object:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user
      });

      // Try to get real initData first
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔍 Processing real initData...');
        
        // Validate initData
        const isValid = validateTelegramInitData(tg.initData);
        if (isValid) {
          // Parse user data
          const initDataParsed = parseTelegramInitData(tg.initData);
          if (initDataParsed?.user) {
            console.log('✅ Valid initData found with user:', initDataParsed.user);
            
            // Try backend verification
            try {
              const verificationResult = await verifyTelegramUser(tg.initData);
              
              if (verificationResult && verificationResult.success) {
                console.log('✅ Backend verification successful');
                
                updateState({
                  user: {
                    id: verificationResult.user_id,
                    first_name: verificationResult.user_data?.first_name || initDataParsed.user.first_name,
                    last_name: verificationResult.user_data?.last_name || initDataParsed.user.last_name,
                    username: verificationResult.user_data?.username || initDataParsed.user.username,
                    language_code: verificationResult.user_data?.language_code || initDataParsed.user.language_code,
                    is_premium: verificationResult.user_data?.is_premium || initDataParsed.user.is_premium,
                    photo_url: verificationResult.user_data?.photo_url || initDataParsed.user.photo_url
                  },
                  isAuthenticated: true,
                  isLoading: false,
                  error: null
                });
                initializedRef.current = true;
                return;
              }
            } catch (backendError) {
              console.warn('⚠️ Backend verification failed:', backendError);
            }
            
            // Use client-side validation in development
            if (process.env.NODE_ENV === 'development') {
              console.log('🔧 Using client-side validation in development');
              updateState({
                user: {
                  id: initDataParsed.user.id,
                  first_name: initDataParsed.user.first_name,
                  last_name: initDataParsed.user.last_name,
                  username: initDataParsed.user.username,
                  language_code: initDataParsed.user.language_code || 'en',
                  is_premium: initDataParsed.user.is_premium,
                  photo_url: initDataParsed.user.photo_url
                },
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              initializedRef.current = true;
              return;
            }
          }
        }
      }

      // Try initDataUnsafe as fallback only in development
      if (process.env.NODE_ENV === 'development' && tg.initDataUnsafe?.user) {
        console.log('🔧 Development fallback - using initDataUnsafe');
        const unsafeUser = tg.initDataUnsafe.user;
        
        updateState({
          user: {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name || 'User',
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          },
          isAuthenticated: true,
          isLoading: false,
          error: 'Using development mode (initDataUnsafe)'
        });
        initializedRef.current = true;
        return;
      }

      // No valid authentication data found
      throw new Error('No valid Telegram authentication data found');
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false,
        isAuthenticated: false
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set a timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          error: 'Authentication timeout - please refresh the app',
          isLoading: false
        });
        initializedRef.current = true;
      }
    }, 10000); // 10 second timeout

    // Start authentication
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
