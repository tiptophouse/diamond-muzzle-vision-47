
import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData
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

      if (!inTelegram) {
        console.log('❌ Not in Telegram environment - access denied');
        updateState({
          isLoading: false,
          isAuthenticated: false,
          accessDeniedReason: 'not_telegram',
          error: 'This app can only be used within Telegram'
        });
        initializedRef.current = true;
        return;
      }

      const tg = getTelegramWebApp();
      if (!tg) {
        console.log('❌ Telegram WebApp not available');
        updateState({
          isLoading: false,
          isAuthenticated: false,
          accessDeniedReason: 'invalid_telegram_data',
          error: 'Telegram WebApp not available'
        });
        initializedRef.current = true;
        return;
      }

      console.log('📱 Telegram WebApp data:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe,
        unsafeUser: tg.initDataUnsafe?.user
      });

      let authenticatedUser: TelegramUser | null = null;

      // Priority 1: Try initDataUnsafe for immediate user data
      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        console.log('🔍 Found user in initDataUnsafe:', unsafeUser);
        
        if (unsafeUser.id && unsafeUser.first_name) {
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
          console.log('✅ Valid user found in initDataUnsafe:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
        }
      }

      // Priority 2: Try real initData with backend verification
      if (!authenticatedUser && tg.initData && tg.initData.length > 0) {
        console.log('🔍 Processing initData for backend verification...');
        
        try {
          // Client-side validation first
          const isValidClient = validateTelegramInitData(tg.initData);
          if (isValidClient) {
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
              console.log('✅ Backend verified user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
            } else {
              console.warn('⚠️ Backend verification failed, trying client-side parsing');
              
              // Fallback to client-side parsing
              const initDataParsed = parseTelegramInitData(tg.initData);
              if (initDataParsed?.user) {
                authenticatedUser = {
                  id: initDataParsed.user.id,
                  first_name: initDataParsed.user.first_name,
                  last_name: initDataParsed.user.last_name,
                  username: initDataParsed.user.username,
                  language_code: initDataParsed.user.language_code || 'en',
                  is_premium: initDataParsed.user.is_premium,
                  photo_url: initDataParsed.user.photo_url
                };
                console.log('✅ Client-side parsed user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ InitData processing failed:', error);
        }
      }

      if (authenticatedUser) {
        console.log('✅ Authentication successful for user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
        
        updateState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          accessDeniedReason: null
        });
      } else {
        console.log('❌ No valid user found - authentication failed');
        updateState({
          isLoading: false,
          isAuthenticated: false,
          accessDeniedReason: 'authentication_failed',
          error: 'Could not authenticate Telegram user'
        });
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      updateState({
        isLoading: false,
        isAuthenticated: false,
        accessDeniedReason: 'authentication_failed',
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          isAuthenticated: false,
          accessDeniedReason: 'authentication_failed',
          error: 'Authentication timeout'
        });
        initializedRef.current = true;
      }
    }, 3000);

    // Start authentication
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
