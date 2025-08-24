
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { parseTelegramInitData, isTelegramWebApp, validateTelegramInitData } from '@/utils/telegramValidation';

const ADMIN_TELEGRAM_ID = 2138564172;

export function useSimpleTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const createAdminUser = (): TelegramUser => {
    return {
      id: ADMIN_TELEGRAM_ID,
      first_name: "Admin",
      last_name: "User", 
      username: "admin",
      language_code: "en"
    };
  };

  const validateAndExtractUser = (tg: any): TelegramUser | null => {
    // Validate signature first
    if (tg.initData && !validateTelegramInitData(tg.initData)) {
      console.warn('Invalid Telegram signature detected');
      return null;
    }

    // Try unsafe data first
    if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
      const user = tg.initDataUnsafe.user;
      console.log('🔍 Found user from initDataUnsafe:', user.id, user.first_name);
      
      if (user.id === ADMIN_TELEGRAM_ID) {
        console.log('✅ ADMIN USER DETECTED from initDataUnsafe!');
        return user;
      } else if (user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)) {
        console.log('✅ Found verified user data from initDataUnsafe');
        return user;
      }
    }
    
    // Try parsed data
    if (tg.initData && tg.initData.length > 0) {
      try {
        const parsedInitData = parseTelegramInitData(tg.initData);
        if (parsedInitData?.user && parsedInitData.user.id) {
          const user = parsedInitData.user;
          console.log('🔍 Found user from parsed initData:', user.id, user.first_name);
          
          if (user.id === ADMIN_TELEGRAM_ID) {
            console.log('✅ ADMIN USER DETECTED from parsed initData!');
            return user;
          } else if (user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)) {
            console.log('✅ Found verified user data from parsed initData');
            return user;
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse initData:', parseError);
      }
    }
    
    return null;
  };

  const initializeAuth = () => {
    if (initializedRef.current || !mountedRef.current) {
      console.log('🔄 Auth already initialized or component unmounted');
      return;
    }

    console.log('🔄 Starting secure auth initialization...');
    
    try {
      // Server-side check
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering - no auth available');
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      const inTelegram = isTelegramWebApp();
      console.log('📱 Telegram environment detected:', inTelegram);
      setIsTelegramEnvironment(inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        const validatedUser = validateAndExtractUser(tg);
        
        if (validatedUser) {
          console.log('✅ Setting validated user:', validatedUser.first_name, 'ID:', validatedUser.id);
          setUser(validatedUser);
          setIsLoading(false);
          initializedRef.current = true;
          return;
        }
        
        console.log('⚠️ In Telegram but no valid user data found');
        setError('Invalid or missing Telegram user data');
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      // Development mode - only allow admin access
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode - providing admin access only');
        const adminUser = createAdminUser();
        setUser(adminUser);
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      // Production without Telegram environment
      console.log('❌ Production environment requires Telegram WebApp');
      setError('This app must be accessed through Telegram');
      setIsLoading(false);
      initializedRef.current = true;

    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      setError('Authentication initialization failed');
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout');
        setError('Authentication timeout');
        setIsLoading(false);
        initializedRef.current = true;
      }
    }, 3000);

    initializeAuth();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated: !!user && !error,
  };
}
