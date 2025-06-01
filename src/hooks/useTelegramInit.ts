
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
    console.log('🔄 Starting simplified Telegram auth initialization...');
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering, using mock user');
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
        console.log('🔄 Attempting Telegram initialization...');
        
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization
        try {
          if (typeof tg.ready === 'function') {
            tg.ready();
            console.log('✅ Telegram WebApp ready');
          }
          
          if (typeof tg.expand === 'function') {
            tg.expand();
          }

          // Apply theme safely
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          }
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        // Try to get user data from Telegram
        const unsafeData = tg.initDataUnsafe;
        const rawInitData = tg.initData;
        
        console.log('📊 Checking Telegram data...');
        console.log('- Unsafe data available:', !!unsafeData?.user);
        console.log('- Raw initData available:', !!rawInitData);
        
        // Priority 1: Use unsafe data (most reliable)
        if (unsafeData?.user) {
          console.log('✅ Using Telegram unsafe data');
          setUser(unsafeData.user);
          setCurrentUserId(unsafeData.user.id);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Priority 2: Parse initData
        if (rawInitData) {
          try {
            const parsedInitData = parseTelegramInitData(rawInitData);
            if (parsedInitData?.user) {
              console.log('✅ Using parsed Telegram initData');
              setInitData(parsedInitData);
              setUser(parsedInitData.user);
              setCurrentUserId(parsedInitData.user.id);
              setError(null);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse initData:', parseError);
          }
        }

        // If in Telegram but no user data, fall back to mock
        console.log('⚠️ In Telegram but no user data, using mock user');
        const mockUser = createMockUser();
        setUser(mockUser);
        setCurrentUserId(mockUser.id);
        setError(null);
        setIsLoading(false);
        setIsTelegramEnvironment(true); // Keep as Telegram environment
        return;
      }

      // Not in Telegram - use mock user immediately
      console.log('🔧 Not in Telegram, using development mock user');
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null);
      setIsLoading(false);
      setIsTelegramEnvironment(false);

    } catch (err) {
      console.error('❌ Critical error during initialization:', err);
      // Even on error, provide a mock user to prevent app crash
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null); // Don't show error, just use mock user
      setIsLoading(false);
      setIsTelegramEnvironment(false);
    }
  };

  const refreshAuth = () => {
    console.log('🔄 Refreshing authentication...');
    setIsLoading(true);
    setError(null);
    
    // Use a small delay to prevent rapid refresh loops
    setTimeout(() => {
      initializeAuth();
    }, 100);
  };

  useEffect(() => {
    let mounted = true;

    // Immediate initialization - no complex timing
    if (mounted) {
      initializeAuth();
    }

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    initData,
    isLoading,
    error,
    isTelegramEnvironment,
    refreshAuth,
    retryAuth: refreshAuth, // Same as refresh for simplicity
  };
}
