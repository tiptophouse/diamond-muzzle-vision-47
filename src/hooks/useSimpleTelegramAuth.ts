
import { useState, useEffect, useRef } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';
import { TelegramUser } from '@/types/telegram';

export function useSimpleTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  // Admin ID for testing
  const ADMIN_TELEGRAM_ID = 2138564172;

  const createAdminUser = (): TelegramUser => {
    return {
      id: ADMIN_TELEGRAM_ID,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      language_code: "en"
    };
  };

  const createMockUser = (): TelegramUser => {
    return {
      id: 1000000000 + Math.floor(Math.random() * 1000000),
      first_name: "Test",
      last_name: "User", 
      username: "testuser",
      language_code: "en"
    };
  };

  const safeSetState = (userData: TelegramUser, telegramEnv: boolean) => {
    if (!mountedRef.current || initializedRef.current) return;
    
    console.log('✅ Setting auth state with user:', userData.first_name, 'ID:', userData.id);
    
    setUser(userData);
    setCurrentUserId(userData.id);
    setIsTelegramEnvironment(telegramEnv);
    setIsAuthenticated(true);
    setError(null);
    setIsLoading(false);
    initializedRef.current = true;
  };

  const initializeAuth = () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting simplified auth initialization...');
    
    try {
      // Server-side check
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering - using admin user for testing');
        const adminUser = createAdminUser();
        safeSetState(adminUser, false);
        return;
      }

      // Enhanced Telegram detection
      const inTelegram = isTelegramWebApp();
      const detection = {
        hasWindow: typeof window !== 'undefined',
        hasTelegram: !!window.Telegram,
        hasWebApp: !!(window.Telegram?.WebApp),
        result: inTelegram
      };
      
      console.log('Telegram WebApp detection:', detection);
      console.log('📱 Telegram environment detected:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        let realUser: TelegramUser | null = null;
        
        // Priority 1: Check if this might be admin testing - look for any admin indicators
        // In development/testing, we can't always get real Telegram data, so check for admin context
        const urlParams = new URLSearchParams(window.location.search);
        const isAdminContext = window.location.pathname.includes('/admin') || 
                              urlParams.get('user') === 'admin' ||
                              localStorage.getItem('dev_admin_mode') === 'true';
        
        if (isAdminContext) {
          console.log('🔧 Admin context detected - using admin user');
          const adminUser = createAdminUser();
          safeSetState(adminUser, true);
          return;
        }
        
        // Priority 2: Try to get real user data from unsafe data
        if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
          const user = tg.initDataUnsafe.user;
          console.log('🔍 Found initDataUnsafe user:', user);
          if (user.first_name && !['Test', 'Telegram', 'Unknown'].includes(user.first_name)) {
            console.log('✅ Found REAL user data from initDataUnsafe');
            realUser = user;
          }
        }
        
        // Priority 3: Parse initData if no real user found
        if (!realUser && tg.initData && tg.initData.length > 0) {
          try {
            console.log('🔍 Parsing initData:', tg.initData);
            const parsedInitData = parseTelegramInitData(tg.initData);
            if (parsedInitData?.user && parsedInitData.user.id) {
              const user = parsedInitData.user;
              console.log('🔍 Parsed user from initData:', user);
              if (user.first_name && !['Test', 'Telegram', 'Unknown'].includes(user.first_name)) {
                console.log('✅ Found REAL user data from parsed initData');
                realUser = user;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse initData:', parseError);
          }
        }
        
        if (realUser) {
          safeSetState(realUser, true);
          return;
        }
        
        // For development when we can't get real data, use admin user if on admin route
        if (window.location.pathname.startsWith('/admin')) {
          console.log('🔧 Admin route detected without real data - using admin user');
          const adminUser = createAdminUser();
          safeSetState(adminUser, true);
          return;
        }
        
        // Fallback for Telegram environment
        console.log('⚠️ In Telegram but no real user data - creating fallback');
        const telegramFallback = createMockUser();
        safeSetState(telegramFallback, true);
        return;
      }

      // Development mode - check if we're trying to access admin
      if (window.location.pathname.startsWith('/admin')) {
        console.log('🔧 Development admin access - using admin user');
        const adminUser = createAdminUser();
        safeSetState(adminUser, false);
        return;
      }

      // Regular development mode fallback
      console.log('🔧 Development mode - using mock user');
      const mockUser = createMockUser();
      safeSetState(mockUser, false);

    } catch (err) {
      console.error('❌ Initialization error:', err);
      // Emergency fallback - if on admin route, use admin user
      if (window.location.pathname.startsWith('/admin')) {
        const adminUser = createAdminUser();
        safeSetState(adminUser, false);
      } else {
        const emergencyUser = createMockUser();
        safeSetState(emergencyUser, false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout - using emergency fallback');
        const emergencyUser = window.location.pathname.startsWith('/admin') 
          ? createAdminUser() 
          : createMockUser();
        safeSetState(emergencyUser, false);
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
    isAuthenticated,
  };
}
