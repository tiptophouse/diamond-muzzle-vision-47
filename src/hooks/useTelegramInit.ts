
import { useState, useEffect } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';
import { TelegramUser, TelegramInitData } from '@/types/telegram';

export function useTelegramInit() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const createMockUser = (): TelegramUser => {
    return {
      id: 2138564172,
      first_name: "Test",
      last_name: "User", 
      username: "testuser",
      language_code: "en"
    };
  };

  const initializeAuth = () => {
    console.log('🔄 Starting Telegram auth initialization...');
    setIsLoading(true);
    setError(null);

    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Not in browser environment, using mock user');
        const mockUser = createMockUser();
        setUser(mockUser);
        setCurrentUserId(mockUser.id);
        setIsTelegramEnvironment(false);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Check for Telegram environment
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);
      console.log('📱 Telegram environment detected:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        console.log('🔄 Proceeding with Telegram initialization...');
        proceedWithTelegramInit();
      } else {
        console.log('🔧 Not in Telegram, using development mock user');
        fallbackToMockUser();
      }

    } catch (err) {
      console.error('❌ Error initializing Telegram auth:', err);
      setError('Authentication initialization failed');
      fallbackToMockUser();
    }
  };

  const proceedWithTelegramInit = () => {
    try {
      const tg = window.Telegram.WebApp;
      console.log('📲 Telegram WebApp object available:', !!tg);
      
      // Initialize WebApp with better error handling
      try {
        if (typeof tg.ready === 'function') {
          tg.ready();
          console.log('✅ Telegram WebApp ready');
        }
        
        if (typeof tg.expand === 'function') {
          tg.expand();
          console.log('🔄 Telegram WebApp expanded');
        }

        // Apply theme safely
        if (tg.themeParams?.bg_color) {
          try {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
            console.log('🎨 Applied Telegram theme');
          } catch (err) {
            console.warn('⚠️ Could not apply Telegram theme:', err);
          }
        }
      } catch (err) {
        console.warn('⚠️ Error during WebApp initialization:', err);
      }
      
      const rawInitData = tg.initData;
      const unsafeData = tg.initDataUnsafe;
      
      console.log('📊 Raw initData available:', !!rawInitData);
      console.log('📊 Unsafe data available:', !!unsafeData?.user);
      
      // Try unsafe data first (most reliable)
      if (unsafeData?.user) {
        console.log('✅ Using unsafe data for user:', unsafeData.user.id);
        setUser(unsafeData.user);
        setCurrentUserId(unsafeData.user.id);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Try parsing initData
      if (rawInitData) {
        const parsedInitData = parseTelegramInitData(rawInitData);
        console.log('✅ Parsed initData available:', !!parsedInitData);
        
        if (parsedInitData?.user) {
          setInitData(parsedInitData);
          setUser(parsedInitData.user);
          setCurrentUserId(parsedInitData.user.id);
          setError(null);
          setIsLoading(false);
          return;
        }
      }

      // If no data available from Telegram, use mock user for development
      console.log('🔧 No user data from Telegram, using mock user for development');
      fallbackToMockUser();

    } catch (err) {
      console.error('❌ Error in Telegram initialization:', err);
      setError('Telegram initialization failed');
      fallbackToMockUser();
    }
  };

  const fallbackToMockUser = () => {
    console.log('🔧 Using mock user for development/fallback');
    try {
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null);
      setIsLoading(false);
      setIsTelegramEnvironment(false);
      console.log('✅ Mock user set successfully:', mockUser.id);
    } catch (err) {
      console.error('❌ Failed to set mock user:', err);
      setError('Failed to initialize user');
      setIsLoading(false);
    }
  };

  const retryAuth = () => {
    if (retryCount < 3) {
      console.log(`🔄 Retrying authentication (attempt ${retryCount + 1}/3)`);
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        initializeAuth();
      }, 1000 * (retryCount + 1));
    } else {
      console.log('❌ Max retry attempts reached, using fallback');
      fallbackToMockUser();
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const delayedInit = () => {
      if (!mounted) return;
      
      // Reduced delay for faster initialization
      timeoutId = setTimeout(() => {
        if (mounted) {
          initializeAuth();
        }
      }, 50);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', delayedInit);
    } else {
      delayedInit();
    }

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener('DOMContentLoaded', delayedInit);
    };
  }, []);

  const refreshAuth = () => {
    console.log('🔄 Refreshing authentication...');
    setRetryCount(0);
    initializeAuth();
  };

  return {
    user,
    initData,
    isLoading,
    error,
    isTelegramEnvironment,
    refreshAuth,
    retryAuth,
  };
}
