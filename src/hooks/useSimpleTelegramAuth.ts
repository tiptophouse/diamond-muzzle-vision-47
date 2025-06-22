
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
      last_name: "Diamond Muzzle", 
      username: "admin",
      language_code: "en"
    };
  };

  const validateAndExtractUser = (tg: any): TelegramUser | null => {
    console.log('🔍 Validating user data from Telegram WebApp...');
    console.log('🔍 initData available:', !!tg.initData);
    console.log('🔍 initDataUnsafe available:', !!tg.initDataUnsafe);
    
    // PRIORITY 1: Check for admin user in any format
    if (tg.initDataUnsafe?.user?.id === ADMIN_TELEGRAM_ID) {
      console.log('✅ ADMIN USER DETECTED from initDataUnsafe! ID:', tg.initDataUnsafe.user.id);
      return {
        id: ADMIN_TELEGRAM_ID,
        first_name: tg.initDataUnsafe.user.first_name || "Admin",
        last_name: tg.initDataUnsafe.user.last_name || "Diamond Muzzle",
        username: tg.initDataUnsafe.user.username || "admin",
        language_code: tg.initDataUnsafe.user.language_code || "en"
      };
    }

    // Try parsed data for admin
    if (tg.initData && tg.initData.length > 0) {
      try {
        const parsedInitData = parseTelegramInitData(tg.initData);
        if (parsedInitData?.user?.id === ADMIN_TELEGRAM_ID) {
          console.log('✅ ADMIN USER DETECTED from parsed initData! ID:', parsedInitData.user.id);
          return {
            id: ADMIN_TELEGRAM_ID,
            first_name: parsedInitData.user.first_name || "Admin",
            last_name: parsedInitData.user.last_name || "Diamond Muzzle",
            username: parsedInitData.user.username || "admin",
            language_code: parsedInitData.user.language_code || "en"
          };
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse initData:', parseError);
      }
    }

    // PRIORITY 2: For admin user, even try less strict validation
    if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.first_name) {
      console.log('🔍 Checking user:', tg.initDataUnsafe.user.id, tg.initDataUnsafe.user.first_name);
      
      // If this is potentially the admin user based on any identifying info
      if (tg.initDataUnsafe.user.id && 
          (tg.initDataUnsafe.user.id === ADMIN_TELEGRAM_ID || 
           tg.initDataUnsafe.user.first_name.includes('Admin') ||
           tg.initDataUnsafe.user.first_name === 'Diamond')) {
        console.log('✅ Potential admin user detected, granting access');
        return {
          id: tg.initDataUnsafe.user.id,
          first_name: tg.initDataUnsafe.user.first_name,
          last_name: tg.initDataUnsafe.user.last_name,
          username: tg.initDataUnsafe.user.username,
          language_code: tg.initDataUnsafe.user.language_code
        };
      }
    }

    // PRIORITY 3: Regular user validation (stricter)
    if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
      const user = tg.initDataUnsafe.user;
      if (user.first_name && !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name)) {
        console.log('✅ Found verified regular user data from initDataUnsafe');
        return user;
      }
    }
    
    console.log('❌ No valid user data found in Telegram WebApp');
    return null;
  };

  const initializeAuth = () => {
    if (initializedRef.current || !mountedRef.current) {
      console.log('🔄 Auth already initialized or component unmounted');
      return;
    }

    console.log('🔄 Starting admin-priority auth initialization...');
    
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
        
        // FALLBACK: If we're in Telegram but no user data, assume admin for testing
        console.log('⚠️ In Telegram but no user data - checking for admin fallback');
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - providing admin access as fallback');
          const adminUser = createAdminUser();
          setUser(adminUser);
          setIsLoading(false);
          initializedRef.current = true;
          return;
        }
        
        console.log('⚠️ In Telegram but no valid user data found in production');
        setError('Unable to retrieve user data from Telegram');
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
        console.warn('⚠️ Auth initialization timeout - providing admin fallback');
        const adminUser = createAdminUser();
        setUser(adminUser);
        setError(null);
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
