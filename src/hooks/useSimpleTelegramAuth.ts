
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';

export function useSimpleTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

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
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting simplified auth initialization...');
    
    try {
      // Server-side check
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering - using fallback');
        const mockUser = createMockUser();
        setUser(mockUser);
        setIsTelegramEnvironment(false);
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      // Enhanced Telegram detection
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
                realUser = user;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse initData:', parseError);
          }
        }
        
        if (realUser) {
          setUser(realUser);
          setIsLoading(false);
          initializedRef.current = true;
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
        setUser(telegramFallback);
        setIsLoading(false);
        initializedRef.current = true;
        return;
      }

      // Development mode fallback
      console.log('🔧 Development mode - using mock user');
      const mockUser = createMockUser();
      setUser(mockUser);
      setIsLoading(false);
      initializedRef.current = true;

    } catch (err) {
      console.error('❌ Initialization error, using emergency fallback:', err);
      const emergencyUser = createMockUser();
      setUser(emergencyUser);
      setError('Auth initialization failed, using fallback');
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout - using emergency fallback');
        const emergencyUser = createMockUser();
        setUser(emergencyUser);
        setError('Auth timeout');
        setIsLoading(false);
        initializedRef.current = true;
      }
    }, 3000); // Reduced from 5000ms

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
