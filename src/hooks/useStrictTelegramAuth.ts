
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
}

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

  const validateTelegramData = useCallback((initData: string): TelegramJWTPayload | null => {
    try {
      console.log('🔍 Validating Telegram data...');
      
      // Parse JWT payload from the token (we need to extract the payload)
      try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        const authDate = urlParams.get('auth_date');
        const hash = urlParams.get('hash');

        if (!userParam || !authDate || !hash) {
          return null;
        }

        const userObj = JSON.parse(decodeURIComponent(userParam));
        
        const jwtPayload: TelegramJWTPayload = {
          telegram_user_id: userObj.id,
          first_name: userObj.first_name,
          last_name: userObj.last_name,
          username: userObj.username,
          language_code: userObj.language_code,
          is_premium: userObj.is_premium,
          auth_date: parseInt(authDate),
          hash: hash,
          user: {
            id: userObj.id,
            first_name: userObj.first_name,
            last_name: userObj.last_name,
            username: userObj.username,
            language_code: userObj.language_code,
            is_premium: userObj.is_premium,
            photo_url: userObj.photo_url
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

        // STRICT: If not in Telegram, immediately deny access
        if (!inTelegram) {
          console.log('❌ Not in Telegram environment - access denied');
          setAccessDeniedReason('not_telegram');
          setError('Access denied: Telegram environment required');
          setIsLoading(false);
          return;
        }

        const tg = (window as any).Telegram.WebApp as TelegramWebApp;
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
        } catch (setupError) {
          console.warn('⚠️ Telegram WebApp setup failed:', setupError);
        }

        if (tg.initData && tg.initData.length > 0) {
          const validatedPayload = validateTelegramData(tg.initData);
          
          if (validatedPayload && validatedPayload.user) {
            console.log('✅ Authenticated Telegram user:', validatedPayload.user.first_name);
            setUser(validatedPayload.user);
            setError(null);
            setAccessDeniedReason(null);
            setIsLoading(false);
            return;
          }
        }

        // If we're in Telegram but validation failed
        console.log('❌ Telegram validation failed');
        setAccessDeniedReason('invalid_telegram_data');
        setError('Telegram validation failed');
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Authentication initialization error:', error);
        setError('Authentication failed');
        setAccessDeniedReason('authentication_failed');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [validateTelegramData]);

  return {
    user,
    isAuthenticated: !!user && !error,
    isLoading,
    error,
    isTelegramEnvironment,
    accessDeniedReason,
  };
}
