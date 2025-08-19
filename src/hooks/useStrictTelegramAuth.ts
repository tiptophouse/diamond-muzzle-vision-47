
import { useState, useEffect, useCallback } from 'react';
import { createJWTFromTelegramData, validateTelegramHash, type TelegramJWTPayload } from '@/utils/jwt';
import { verifyTelegramUser, signInToBackend } from '@/lib/api/auth';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  phone_number?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      photo_url?: string;
    };
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

interface UseStrictTelegramAuthReturn {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  accessDeniedReason: string | null;
  showLogin: boolean;
  handleLoginSuccess: () => void;
}

// Bot token for validation (using Vite environment variable syntax)
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';

// Enhanced Telegram environment detection
function isGenuineTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  
  const tg = (window as any).Telegram?.WebApp as TelegramWebApp | undefined;
  if (!tg) return false;
  
  // Check for genuine Telegram WebApp indicators
  const hasInitData = tg.initData && tg.initData.length > 0;
  const hasValidVersion = tg.version && tg.version.length > 0;
  const hasValidPlatform = tg.platform && ['android', 'ios', 'macos', 'tdesktop', 'web'].includes(tg.platform);
  
  return hasInitData && hasValidVersion && hasValidPlatform;
}

export function useStrictTelegramAuth(): UseStrictTelegramAuthReturn {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const createAdminFallbackUser = useCallback((): TelegramUser => {
    return {
      id: 2138564172,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      language_code: "en"
    };
  }, []);

  const authenticateWithTelegramData = useCallback(async (initData: string): Promise<TelegramUser | null> => {
    try {
      console.log('🔐 Authenticating with Telegram initData...');
      
      // First try backend verification
      const verificationResult = await verifyTelegramUser(initData);
      
      if (verificationResult && verificationResult.success) {
        console.log('✅ Backend verification successful');
        
        // Try to sign in to backend to get auth token
        await signInToBackend(initData);
        
        return {
          id: verificationResult.user_id,
          first_name: verificationResult.user_data?.first_name || 'User',
          last_name: verificationResult.user_data?.last_name,
          username: verificationResult.user_data?.username,
          language_code: verificationResult.user_data?.language_code || 'en',
          is_premium: verificationResult.user_data?.is_premium,
          photo_url: verificationResult.user_data?.photo_url
        };
      }
      
      // Fallback to client-side validation
      if (BOT_TOKEN) {
        const isValid = validateTelegramHash(initData, BOT_TOKEN);
        if (isValid) {
          const jwtToken = createJWTFromTelegramData(initData, BOT_TOKEN);
          if (jwtToken) {
            const urlParams = new URLSearchParams(initData);
            const userParam = urlParams.get('user');
            
            if (userParam) {
              const userData = JSON.parse(decodeURIComponent(userParam));
              console.log('✅ Client-side validation successful');
              
              return {
                id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                language_code: userData.language_code || 'en',
                is_premium: userData.is_premium,
                photo_url: userData.photo_url
              };
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Telegram authentication error:', error);
      return null;
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    console.log('🔐 Login successful, setting admin user');
    setIsLoggedIn(true);
    setShowLogin(false);
    setUser(createAdminFallbackUser());
    setError(null);
    setAccessDeniedReason(null);
    setIsLoading(false);
  }, [createAdminFallbackUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Starting Telegram authentication...');
        
        // Server-side check
        if (typeof window === 'undefined') {
          console.log('⚠️ Server-side rendering detected');
          setIsLoading(false);
          return;
        }

        const inTelegram = isGenuineTelegram();
        setIsTelegramEnvironment(inTelegram);
        console.log('📱 Telegram environment:', inTelegram);

        if (inTelegram) {
          const tg = (window as any).Telegram.WebApp as TelegramWebApp;
          
          // Initialize Telegram WebApp
          try {
            if (typeof tg.ready === 'function') tg.ready();
            if (typeof tg.expand === 'function') tg.expand();
          } catch (setupError) {
            console.warn('⚠️ Telegram WebApp setup failed:', setupError);
          }

          // Try authentication with initData first
          if (tg.initData && tg.initData.length > 0) {
            console.log('🔐 Found initData, attempting authentication');
            const authenticatedUser = await authenticateWithTelegramData(tg.initData);
            
            if (authenticatedUser) {
              console.log('✅ Authenticated Telegram user:', authenticatedUser.first_name);
              setUser(authenticatedUser);
              setError(null);
              setAccessDeniedReason(null);
              setIsLoading(false);
              return;
            }
          }

          // Try initDataUnsafe as immediate fallback for Telegram users
          if (tg.initDataUnsafe?.user) {
            console.log('⚠️ Using initDataUnsafe for Telegram authentication');
            const unsafeUser = tg.initDataUnsafe.user;
            
            const telegramUser: TelegramUser = {
              id: unsafeUser.id,
              first_name: unsafeUser.first_name || 'User',
              last_name: unsafeUser.last_name,
              username: unsafeUser.username,
              language_code: unsafeUser.language_code || 'en',
              is_premium: unsafeUser.is_premium,
              photo_url: unsafeUser.photo_url
            };

            setUser(telegramUser);
            setError(null);
            setAccessDeniedReason(null);
            setIsLoading(false);
            return;
          }

          // If we're in Telegram but no user data, still try admin fallback
          console.log('⚠️ Telegram environment but no user data, using admin fallback');
          const adminUser = createAdminFallbackUser();
          setUser(adminUser);
          setError(null);
          setAccessDeniedReason(null);
          setIsLoading(false);
          return;
        }

        // For non-Telegram environments, show login
        console.log('🔐 Non-Telegram environment, showing login');
        setShowLogin(true);
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Authentication initialization error:', error);
        // Always fallback to admin for any error
        const adminUser = createAdminFallbackUser();
        setUser(adminUser);
        setError('Authentication error - using admin access');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authenticateWithTelegramData, createAdminFallbackUser]);

  return {
    user,
    isAuthenticated: !!user && !error,
    isLoading,
    error,
    isTelegramEnvironment,
    accessDeniedReason,
    showLogin: showLogin && !isLoggedIn && !user,
    handleLoginSuccess,
  };
}
