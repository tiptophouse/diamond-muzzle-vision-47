
import { useState, useEffect, useRef } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';
import { TelegramUser, TelegramInitData } from '@/types/telegram';

export function useTelegramInit() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const initializationLockRef = useRef(false);

  const extractRealTelegramUser = (): TelegramUser | null => {
    console.log('🔍 Starting aggressive Telegram user extraction...');
    
    // Priority 1: Check URL parameters for initData
    const urlParams = new URLSearchParams(window.location.search);
    const urlInitData = urlParams.get('tgWebAppData') || urlParams.get('initData');
    if (urlInitData) {
      console.log('📋 Found initData in URL parameters, parsing...');
      try {
        const parsed = parseTelegramInitData(urlInitData);
        if (parsed?.user?.id) {
          console.log('✅ REAL USER from URL:', parsed.user.id, parsed.user.first_name);
          setInitData(parsed);
          return parsed.user;
        }
      } catch (error) {
        console.warn('Failed to parse URL initData:', error);
      }
    }

    // Priority 2: WebApp initData (raw string)
    if (window.Telegram?.WebApp?.initData) {
      console.log('📋 Found WebApp initData, parsing...');
      try {
        const parsed = parseTelegramInitData(window.Telegram.WebApp.initData);
        if (parsed?.user?.id) {
          console.log('✅ REAL USER from WebApp initData:', parsed.user.id, parsed.user.first_name);
          setInitData(parsed);
          return parsed.user;
        }
      } catch (error) {
        console.warn('Failed to parse WebApp initData:', error);
      }
    }

    // Priority 3: WebApp initDataUnsafe (direct object)
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user.id && typeof user.id === 'number') {
        console.log('✅ REAL USER from initDataUnsafe:', user.id, user.first_name);
        return user;
      }
    }

    // Priority 4: Check window.__TELEGRAM_USER__ (sometimes set by bots)
    if ((window as any).__TELEGRAM_USER__) {
      const user = (window as any).__TELEGRAM_USER__;
      if (user.id && typeof user.id === 'number') {
        console.log('✅ REAL USER from window.__TELEGRAM_USER__:', user.id, user.first_name);
        return user;
      }
    }

    console.warn('❌ No real Telegram user found in any source');
    return null;
  };

  const createFallbackUser = (): TelegramUser => {
    // Create a consistent fallback for development
    return {
      id: 2138564172, // Use a consistent dev ID
      first_name: "Dev",
      last_name: "User", 
      username: "devuser",
      language_code: "en"
    };
  };

  const safeSetState = (userData: TelegramUser, telegramEnv: boolean, isRealData: boolean = false, errorMsg: string | null = null) => {
    if (!mountedRef.current || initializedRef.current) return;
    
    console.log('✅ Setting auth state:', {
      userId: userData.id,
      name: userData.first_name,
      isReal: isRealData,
      isTelegram: telegramEnv
    });
    
    setUser(userData);
    setCurrentUserId(userData.id);
    setIsTelegramEnvironment(telegramEnv);
    setError(errorMsg);
    setIsLoading(false);
    initializedRef.current = true;
  };

  const initializeAuth = () => {
    if (initializationLockRef.current || initializedRef.current || !mountedRef.current) {
      return;
    }

    initializationLockRef.current = true;
    console.log('🔄 Starting enhanced auth initialization...');
    
    try {
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering - using fallback');
        const fallbackUser = createFallbackUser();
        safeSetState(fallbackUser, false, false);
        return;
      }

      const inTelegram = isTelegramWebApp();
      console.log('📱 Telegram environment detected:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Initialize WebApp safely
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          }
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed:', themeError);
        }
        
        // Try to extract real user data
        const realUser = extractRealTelegramUser();
        
        if (realUser) {
          console.log('🎉 Successfully extracted real Telegram user!');
          safeSetState(realUser, true, true);
          return;
        }
        
        console.warn('⚠️ In Telegram but no real user data found - this should not happen in production!');
      }

      // Development fallback - only use if not in Telegram
      console.log('🔧 Using development fallback user');
      const fallbackUser = createFallbackUser();
      safeSetState(fallbackUser, false, false);

    } catch (err) {
      console.error('❌ Critical initialization error:', err);
      const emergencyUser = createFallbackUser();
      safeSetState(emergencyUser, false, false, `Initialization error: ${err}`);
    } finally {
      initializationLockRef.current = false;
    }
  };

  const refreshAuth = () => {
    if (initializationLockRef.current) return;
    
    console.log('🔄 Refreshing auth...');
    initializedRef.current = false;
    setIsLoading(true);
    setError(null);
    
    setTimeout(initializeAuth, 100);
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        console.warn('⚠️ Auth initialization timeout - using emergency fallback');
        const emergencyUser = createFallbackUser();
        safeSetState(emergencyUser, false, false, 'Initialization timeout');
      }
    }, 10000); // Increased timeout for better extraction
    
    initializeAuth();

    return () => {
      mountedRef.current = false;
      initializationLockRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    user,
    initData,
    isLoading,
    error,
    isTelegramEnvironment,
    refreshAuth,
    retryAuth: refreshAuth,
  };
}
