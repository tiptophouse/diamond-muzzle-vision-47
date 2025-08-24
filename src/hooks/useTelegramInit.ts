
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

  const createMockUser = (): TelegramUser => {
    return {
      id: 2138564172,
      first_name: "Test",
      last_name: "User", 
      username: "testuser",
      language_code: "en"
    };
  };

  // Background database operations (non-blocking)
  const saveUserToDatabase = async (userData: TelegramUser, isRealData: boolean = false) => {
    try {
      console.log('💾 Background: Saving user data to database');
      const { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } = await import('@/utils/telegramUserData');
      const extractedData = extractTelegramUserData(userData);
      await upsertUserProfile(extractedData);
      await initializeUserAnalytics(userData.id);
      console.log('✅ Background: User data saved successfully');
    } catch (error) {
      console.warn('⚠️ Background: Failed to save user data, but continuing...', error);
      // Don't throw - this is background operation
    }
  };

  const safeSetState = (userData: TelegramUser, telegramEnv: boolean, isRealData: boolean = false, errorMsg: string | null = null) => {
    if (!mountedRef.current || initializedRef.current) return;
    
    console.log('✅ Setting auth state with user:', userData.first_name);
    
    // Set state immediately for fast UI
    setUser(userData);
    setCurrentUserId(userData.id);
    setIsTelegramEnvironment(telegramEnv);
    setError(errorMsg);
    setIsLoading(false);
    initializedRef.current = true;
    
    // Save to database in background (non-blocking)
    setTimeout(() => {
      saveUserToDatabase(userData, isRealData);
    }, 100);
  };

  const initializeAuth = () => {
    if (initializationLockRef.current || initializedRef.current || !mountedRef.current) {
      return;
    }

    initializationLockRef.current = true;
    console.log('🔄 Starting fast auth initialization...');
    
    try {
      // Server-side check
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering - using fallback');
        const mockUser = createMockUser();
        safeSetState(mockUser, false, false);
        return;
      }

      // Enhanced Telegram detection
      const inTelegram = isTelegramWebApp();
      console.log('📱 Telegram environment detected:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          
          // Apply theme safely
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          }
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        // Try to get real user data
        let realUser: TelegramUser | null = null;
        
        // Priority 1: Use unsafe data if it looks real
        if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
          const user = tg.initDataUnsafe.user;
          if (user.first_name && user.first_name !== 'Test' && user.first_name !== 'Telegram') {
            console.log('✅ Found REAL user data from initDataUnsafe');
            realUser = user;
          }
        }
        
        // Priority 2: Parse initData if no real user found
        if (!realUser && tg.initData && tg.initData.length > 0) {
          try {
            const parsedInitData = parseTelegramInitData(tg.initData);
            if (parsedInitData?.user && parsedInitData.user.id) {
              const user = parsedInitData.user;
              if (user.first_name && user.first_name !== 'Test' && user.first_name !== 'Telegram') {
                console.log('✅ Found REAL user data from parsed initData');
                setInitData(parsedInitData);
                realUser = user;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse initData:', parseError);
          }
        }
        
        if (realUser) {
          safeSetState(realUser, true, true);
          return;
        }
        
        // Fallback for Telegram environment
        console.log('⚠️ In Telegram but no real user data - creating fallback');
        const telegramFallback = {
          id: 1000000000 + Math.floor(Math.random() * 1000000),
          first_name: "Telegram",
          last_name: "User",
          username: "telegram_user_" + Math.floor(Math.random() * 1000),
          language_code: "en"
        };
        safeSetState(telegramFallback, true, false);
        return;
      }

      // Development mode fallback
      console.log('🔧 Development mode - using mock user');
      const mockUser = createMockUser();
      safeSetState(mockUser, false, false);

    } catch (err) {
      console.error('❌ Initialization error, using emergency fallback:', err);
      const emergencyUser = {
        id: 999999999,
        first_name: "Emergency",
        last_name: "User",
        username: "emergency_user",
        language_code: "en"
      };
      safeSetState(emergencyUser, false, false);
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
    
    // Set timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        console.warn('⚠️ Auth initialization timeout - using emergency fallback');
        const emergencyUser = createMockUser();
        safeSetState(emergencyUser, false, false);
      }
    }, 5000);
    
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
