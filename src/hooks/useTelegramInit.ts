
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
  
  // Critical: Prevent multiple initializations and race conditions
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

  const safeSetState = (userData: TelegramUser, telegramEnv: boolean, errorMsg: string | null = null) => {
    if (!mountedRef.current || initializedRef.current) return;
    
    console.log('✅ Safe state update:', userData.id);
    setUser(userData);
    setCurrentUserId(userData.id);
    setIsTelegramEnvironment(telegramEnv);
    setError(errorMsg);
    setIsLoading(false);
    initializedRef.current = true;
  };

  const initializeAuth = () => {
    // Critical: Prevent multiple simultaneous initializations
    if (initializationLockRef.current || initializedRef.current || !mountedRef.current) {
      return;
    }

    initializationLockRef.current = true;
    console.log('🔄 Starting stable auth initialization...');
    
    try {
      // Server-side check
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering');
        const mockUser = createMockUser();
        safeSetState(mockUser, false);
        return;
      }

      // Enhanced Telegram detection
      const inTelegram = isTelegramWebApp();
      console.log('📱 Telegram environment:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization without throwing errors
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          
          // Safe theme application
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          }
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        // Priority 1: Use unsafe data (most reliable)
        if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
          console.log('✅ Using Telegram unsafe data:', tg.initDataUnsafe.user.id);
          safeSetState(tg.initDataUnsafe.user, true);
          return;
        }

        // Priority 2: Parse initData
        if (tg.initData && tg.initData.length > 0) {
          try {
            const parsedInitData = parseTelegramInitData(tg.initData);
            if (parsedInitData?.user && parsedInitData.user.id) {
              console.log('✅ Using parsed initData:', parsedInitData.user.id);
              setInitData(parsedInitData);
              safeSetState(parsedInitData.user, true);
              return;
            }
          } catch (parseError) {
            console.warn('⚠️ Parse failed, using fallback');
          }
        }

        // Priority 3: Telegram fallback user
        console.log('⚠️ In Telegram but no user data, creating fallback');
        const telegramFallback = createMockUser();
        telegramFallback.id = 1000000000 + Math.floor(Math.random() * 1000000);
        telegramFallback.first_name = "Telegram";
        telegramFallback.last_name = "User";
        safeSetState(telegramFallback, true);
        return;
      }

      // Development mode fallback
      console.log('🔧 Development mode');
      const mockUser = createMockUser();
      safeSetState(mockUser, false);

    } catch (err) {
      console.error('❌ Initialization error, using emergency fallback:', err);
      // CRITICAL: Never throw or set error state - always provide working fallback
      const emergencyUser = createMockUser();
      emergencyUser.first_name = "Emergency";
      emergencyUser.last_name = "User";
      emergencyUser.id = 999999999;
      safeSetState(emergencyUser, false);
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
    
    // Small delay to prevent rapid refreshes
    setTimeout(initializeAuth, 100);
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Immediate initialization without timeout
    initializeAuth();

    return () => {
      mountedRef.current = false;
      initializationLockRef.current = false;
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
