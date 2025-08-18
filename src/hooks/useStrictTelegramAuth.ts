
import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { verifyTelegramUser, signInToBackend } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';

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
  showLogin: boolean;
  accessDeniedReason: string | null;
  handleLoginSuccess: () => void;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function useStrictTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    showLogin: false,
    accessDeniedReason: null,
    handleLoginSuccess: () => {}
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const handleLoginSuccess = () => {
    console.log('✅ Admin login successful, creating admin user');
    const adminUser: TelegramUser = {
      id: ADMIN_TELEGRAM_ID,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      language_code: "en"
    };
    
    setCurrentUserId(ADMIN_TELEGRAM_ID);
    updateState({
      user: adminUser,
      isAuthenticated: true,
      showLogin: false,
      isLoading: false,
      error: null
    });
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting Telegram authentication...');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment detected:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      if (inTelegram) {
        // Initialize Telegram WebApp
        try {
          await initializeTelegramWebApp();
          const tg = getTelegramWebApp();
          
          if (tg) {
            console.log('📱 Telegram WebApp initialized:', {
              hasInitData: !!tg.initData,
              initDataLength: tg.initData?.length || 0,
              hasInitDataUnsafe: !!tg.initDataUnsafe,
              unsafeUser: tg.initDataUnsafe?.user
            });

            let authenticatedUser: TelegramUser | null = null;

            // Try initDataUnsafe first (most reliable in Mini Apps)
            if (tg.initDataUnsafe?.user) {
              const unsafeUser = tg.initDataUnsafe.user;
              console.log('✅ User found in initDataUnsafe:', unsafeUser.first_name, 'ID:', unsafeUser.id);
              
              authenticatedUser = {
                id: unsafeUser.id,
                first_name: unsafeUser.first_name || 'User',
                last_name: unsafeUser.last_name,
                username: unsafeUser.username,
                language_code: unsafeUser.language_code || 'en',
                is_premium: unsafeUser.is_premium,
                photo_url: unsafeUser.photo_url
              };
            }
            // Try initData with backend verification
            else if (tg.initData && tg.initData.length > 0) {
              console.log('🔍 Trying backend verification with initData...');
              
              try {
                // Try to sign in to backend first
                const backendToken = await signInToBackend(tg.initData);
                
                if (backendToken) {
                  console.log('✅ Backend sign-in successful');
                  
                  // Then verify with backend
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
                  }
                } else {
                  console.warn('⚠️ Backend sign-in failed, no token received');
                }
              } catch (backendError) {
                console.warn('⚠️ Backend verification failed:', backendError);
              }
            }

            if (authenticatedUser) {
              console.log('✅ Telegram authentication successful:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
              setCurrentUserId(authenticatedUser.id);
              updateState({
                user: authenticatedUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                showLogin: false
              });
              initializedRef.current = true;
              return;
            }
          }
        } catch (webAppError) {
          console.warn('⚠️ Telegram WebApp initialization failed:', webAppError);
        }

        // If we're in Telegram but no user data found, show access denied
        console.log('❌ No Telegram user data found in Mini App environment');
        updateState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Unable to authenticate with Telegram',
          accessDeniedReason: 'No valid Telegram user data found',
          showLogin: false
        });
        initializedRef.current = true;
        return;
      }

      // Not in Telegram environment - show admin login for web access
      console.log('🌐 Not in Telegram environment, showing admin login');
      updateState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        showLogin: true,
        accessDeniedReason: null,
        handleLoginSuccess
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed',
        showLogin: true,
        handleLoginSuccess
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for emergency fallback
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          error: 'Authentication timeout',
          showLogin: true,
          handleLoginSuccess
        });
        initializedRef.current = true;
      }
    }, 5000);

    // Start authentication
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
