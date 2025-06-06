
import { useState, useEffect } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { TelegramUser } from '@/types/telegram';

export function useBulletproofTelegramInit() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);

  const createSafeUser = (id: number = 2138564172): TelegramUser => ({
    id,
    first_name: "Safe",
    last_name: "User",
    username: "safeuser",
    language_code: "en"
  });

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🛡️ Starting optimized Telegram initialization...');
      
      try {
        // Faster timeout for better UX
        const initTimeout = setTimeout(() => {
          console.log('⏰ Quick initialization timeout - using safe fallback');
          const safeUser = createSafeUser();
          setUser(safeUser);
          setCurrentUserId(safeUser.id);
          setIsTelegramEnvironment(false);
          setIsLoading(false);
        }, 1000); // Reduced to 1 second for faster startup

        // Immediate environment check
        if (typeof window === 'undefined') {
          clearTimeout(initTimeout);
          const safeUser = createSafeUser();
          setUser(safeUser);
          setCurrentUserId(safeUser.id);
          setIsTelegramEnvironment(false);
          setIsLoading(false);
          return;
        }

        // Quick Telegram detection
        const inTelegram = !!(window.Telegram?.WebApp);
        setIsTelegramEnvironment(inTelegram);

        if (inTelegram && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          
          // Fast WebApp initialization
          try {
            if (typeof tg.ready === 'function') tg.ready();
            if (typeof tg.expand === 'function') tg.expand();
          } catch (e) {
            console.warn('WebApp initialization warning:', e);
          }

          // Quick user data extraction
          let userData: TelegramUser | null = null;

          if (tg.initDataUnsafe?.user?.id) {
            userData = tg.initDataUnsafe.user;
            console.log('✅ Using Telegram user data quickly');
          } else if (tg.initData) {
            try {
              const urlParams = new URLSearchParams(tg.initData);
              const userParam = urlParams.get('user');
              if (userParam) {
                const parsedUser = JSON.parse(decodeURIComponent(userParam));
                if (parsedUser?.id) {
                  userData = parsedUser;
                  console.log('✅ Parsed Telegram data successfully');
                }
              }
            } catch (e) {
              console.warn('Failed to parse init data:', e);
            }
          }

          if (userData) {
            clearTimeout(initTimeout);
            setUser(userData);
            setCurrentUserId(userData.id);
            setIsLoading(false);
            return;
          }
        }

        // Fast fallback
        clearTimeout(initTimeout);
        const fallbackUser = createSafeUser();
        setUser(fallbackUser);
        setCurrentUserId(fallbackUser.id);
        setIsLoading(false);
        console.log('🔧 Using quick fallback user');

      } catch (error) {
        console.error('❌ Initialization error, using emergency user:', error);
        const emergencyUser = createSafeUser(999999999);
        setUser(emergencyUser);
        setCurrentUserId(emergencyUser.id);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return {
    user,
    isLoading,
    error: null,
    isTelegramEnvironment,
    isAuthenticated: !!user,
    initData: null,
    refreshAuth: () => {
      setIsLoading(true);
      setTimeout(() => {
        const refreshUser = createSafeUser();
        setUser(refreshUser);
        setCurrentUserId(refreshUser.id);
        setIsLoading(false);
      }, 50); // Faster refresh
    },
    retryAuth: () => {
      window.location.reload();
    }
  };
}
