
import { useState, useEffect, useRef } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';
import { TelegramUser, TelegramInitData } from '@/types/telegram';
import { extractTelegramUserData, upsertUserProfile, initializeUserAnalytics } from '@/utils/telegramUserData';

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

  const saveUserToDatabase = async (userData: TelegramUser, isRealData: boolean = false) => {
    if (isRealData) {
      console.log('💾 Saving real Telegram user data to database:', userData);
      const extractedData = extractTelegramUserData(userData);
      await upsertUserProfile(extractedData);
      await initializeUserAnalytics(userData.id);
    } else {
      console.log('💾 Saving mock user data to database (development mode)');
      const extractedData = extractTelegramUserData(userData);
      await upsertUserProfile(extractedData);
      await initializeUserAnalytics(userData.id);
    }
  };

  const safeSetState = async (userData: TelegramUser, telegramEnv: boolean, isRealData: boolean = false, errorMsg: string | null = null) => {
    if (!mountedRef.current || initializedRef.current) return;
    
    console.log('✅ Safe state update with user data:', userData);
    
    // Save to database first
    await saveUserToDatabase(userData, isRealData);
    
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
        safeSetState(mockUser, false, false);
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
        
        // Priority 1: Use unsafe data (most reliable) - EXTRACT REAL DATA
        if (tg.initDataUnsafe?.user && tg.initDataUnsafe.user.id) {
          console.log('✅ Using REAL Telegram user data:', tg.initDataUnsafe.user);
          const realUser = tg.initDataUnsafe.user;
          
          // Validate that we have real user data (not placeholder)
          if (realUser.first_name && realUser.first_name !== 'Test' && realUser.first_name !== 'Telegram') {
            console.log('🎉 Found REAL user data - saving to database');
            safeSetState(realUser, true, true);
            return;
          } else {
            console.log('⚠️ User data appears to be placeholder, checking initData...');
          }
        }

        // Priority 2: Parse initData for real user information
        if (tg.initData && tg.initData.length > 0) {
          try {
            const parsedInitData = parseTelegramInitData(tg.initData);
            if (parsedInitData?.user && parsedInitData.user.id) {
              console.log('✅ Using parsed REAL initData:', parsedInitData.user);
              const realUser = parsedInitData.user;
              
              // Validate real data
              if (realUser.first_name && realUser.first_name !== 'Test' && realUser.first_name !== 'Telegram') {
                console.log('🎉 Found REAL parsed user data - saving to database');
                setInitData(parsedInitData);
                safeSetState(realUser, true, true);
                return;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Parse failed, using fallback');
          }
        }

        // Priority 3: Telegram environment but no real data - create identifiable fallback
        console.log('⚠️ In Telegram but no real user data found, creating Telegram fallback');
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

      // Development mode fallback with clear identification
      console.log('🔧 Development mode - creating mock user');
      const mockUser = createMockUser();
      safeSetState(mockUser, false, false);

    } catch (err) {
      console.error('❌ Initialization error, using emergency fallback:', err);
      // CRITICAL: Never throw or set error state - always provide working fallback
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
