
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';

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

  const initializeAuth = () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting simplified auth initialization...');
    
    try {
      // Server-side check
      if (typeof window === 'undefined') {
        const adminUser = createAdminUser();
        setUser(adminUser);
        setIsTelegramEnvironment(false);
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      // Enhanced Telegram detection
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization - prevent crashes
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        // Try to get real user data with better error handling
        let realUser: TelegramUser | null = null;
        
        try {
          // Priority 1: Use unsafe data if it looks real
          if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
            const user = tg.initDataUnsafe.user;
            
            // Check if this is the admin user
            if (user.id === ADMIN_TELEGRAM_ID) {
              console.log('✅ ADMIN USER DETECTED from initDataUnsafe!');
              realUser = user;
            } else if (user.first_name && user.first_name !== 'Test' && user.first_name !== 'Telegram') {
              console.log('✅ Found real user data from initDataUnsafe');
              realUser = user;
            }
          }
          
          // Priority 2: Parse initData if no real user found
          if (!realUser && tg.initData && tg.initData.length > 0) {
            const parsedInitData = parseTelegramInitData(tg.initData);
            if (parsedInitData?.user && parsedInitData.user.id) {
              const user = parsedInitData.user;
              
              if (user.id === ADMIN_TELEGRAM_ID) {
                console.log('✅ ADMIN USER DETECTED from parsed initData!');
                realUser = user;
              } else if (user.first_name && user.first_name !== 'Test' && user.first_name !== 'Telegram') {
                console.log('✅ Found real user data from parsed initData');
                realUser = user;
              }
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse user data, using fallback:', parseError);
        }
        
        if (realUser) {
          console.log('✅ Setting real user:', realUser.first_name, 'ID:', realUser.id);
          setUser(realUser);
          setIsLoading(false);
          initializedRef.current = true;
          return;
        }
        
        // For development/testing: Always provide admin access in Telegram environment
        console.log('⚠️ In Telegram but no real user data - providing admin access for testing');
        const adminUser = createAdminUser();
        setUser(adminUser);
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      // Development mode - always provide admin access
      console.log('🔧 Development mode - providing admin access');
      const adminUser = createAdminUser();
      setUser(adminUser);
      setIsLoading(false);
      initializedRef.current = true;

    } catch (err) {
      console.error('❌ Initialization error, providing admin fallback:', err);
      const adminUser = createAdminUser();
      setUser(adminUser);
      setError('Auth initialization failed, using admin fallback');
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Prevent memory leaks with shorter timeout
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout - providing admin access');
        const adminUser = createAdminUser();
        setUser(adminUser);
        setError('Auth timeout - admin access granted');
        setIsLoading(false);
        initializedRef.current = true;
      }
    }, 2000); // Reduced timeout to prevent hanging

    // Initialize immediately
    initializeAuth();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []); // Simplified dependencies to prevent re-initialization

  return {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated: !!user && !error,
  };
}
