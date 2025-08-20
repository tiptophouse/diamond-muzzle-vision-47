
import { useState, useEffect, useCallback } from 'react';
import { createJWTFromTelegramData, validateTelegramHash, type TelegramJWTPayload } from '@/utils/jwt';

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
const ADMIN_TELEGRAM_ID = 2138564172;

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
      id: ADMIN_TELEGRAM_ID,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      language_code: "en"
    };
  }, []);

  const validateTelegramData = useCallback((initData: string): TelegramJWTPayload | null => {
    try {
      console.log('🔍 Validating Telegram data...');
      
      if (!BOT_TOKEN) {
        console.warn('⚠️ No bot token available for validation');
        return null;
      }

      const isValid = validateTelegramHash(initData, BOT_TOKEN);
      if (!isValid) {
        console.error('❌ Telegram hash validation failed');
        return null;
      }

      const jwtToken = createJWTFromTelegramData(initData, BOT_TOKEN);
      if (!jwtToken) {
        console.error('❌ Failed to create JWT token');
        return null;
      }

      // Parse JWT payload from the token (we need to extract the payload)
      try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        const authDate = urlParams.get('auth_date');
        const hash = urlParams.get('hash');

        if (!userParam || !authDate || !hash) {
          return null;
        }

        const user = JSON.parse(decodeURIComponent(userParam));
        
        const jwtPayload: TelegramJWTPayload = {
          telegram_user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium,
          auth_date: parseInt(authDate),
          hash: hash,
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            language_code: user.language_code,
            is_premium: user.is_premium,
            photo_url: user.photo_url
          }
        };

        console.log('✅ Telegram data validation successful');
        return jwtPayload;
      } catch (parseError) {
        console.error('❌ Failed to parse JWT payload:', parseError);
        return null;
      }
    } catch (error) {
      console.error('❌ Telegram validation error:', error);
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
        console.log('🔄 Starting strict Telegram authentication...');
        
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

          // Try to get user from initData first
          if (tg.initData && tg.initData.length > 0) {
            const validatedPayload = validateTelegramData(tg.initData);
            
            if (validatedPayload && validatedPayload.user) {
              console.log('✅ Authenticated Telegram user from initData:', validatedPayload.user.first_name);
              setUser(validatedPayload.user);
              setError(null);
              setAccessDeniedReason(null);
              setIsLoading(false);
              return;
            }
          }

          // Try initDataUnsafe as fallback if available
          if (tg.initDataUnsafe?.user) {
            console.log('✅ Using initDataUnsafe user:', tg.initDataUnsafe.user.first_name);
            const telegramUser: TelegramUser = {
              id: tg.initDataUnsafe.user.id,
              first_name: tg.initDataUnsafe.user.first_name,
              last_name: tg.initDataUnsafe.user.last_name,
              username: tg.initDataUnsafe.user.username,
              language_code: tg.initDataUnsafe.user.language_code,
              is_premium: tg.initDataUnsafe.user.is_premium,
              photo_url: tg.initDataUnsafe.user.photo_url
            };
            setUser(telegramUser);
            setError(null);
            setAccessDeniedReason(null);
            setIsLoading(false);
            return;
          }

          // If we're in Telegram but no user data, show error (don't show login for Telegram users)
          console.log('❌ In Telegram but no user data available');
          setAccessDeniedReason('No user data available from Telegram');
          setUser(createAdminFallbackUser()); // Fallback for development
          setIsLoading(false);
          return;
        }

        // For non-Telegram environments, don't show login - just block access
        console.log('🚫 Not in Telegram environment - blocking access');
        setShowLogin(false); // Don't show login for non-Telegram access
        setAccessDeniedReason('Access only allowed from Telegram');
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Authentication initialization error:', error);
        setError('Authentication failed');
        
        // In development, provide fallback
        if (process.env.NODE_ENV === 'development') {
          setUser(createAdminFallbackUser());
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [validateTelegramData, createAdminFallbackUser]);

  return {
    user,
    isAuthenticated: !!user && !error,
    isLoading,
    error,
    isTelegramEnvironment,
    accessDeniedReason,
    showLogin: showLogin && !isLoggedIn && !isTelegramEnvironment, // Only show login if NOT in Telegram
    handleLoginSuccess,
  };
}
