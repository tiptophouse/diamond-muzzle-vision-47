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
      id: 123456789,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "en"
    };
  };

  const initializeAuth = () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting Telegram auth initialization...');
      
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);
      console.log('Is in Telegram environment:', inTelegram);

      if (!inTelegram) {
        console.log('Not in Telegram environment, using mock user for development');
        const mockUser = createMockUser();
        setUser(mockUser);
        setCurrentUserId(mockUser.id);
        setError(null);
        setIsLoading(false);
        return;
      }

      const tg = window.Telegram!.WebApp;
      console.log('Telegram WebApp object:', tg);
      console.log('Telegram WebApp version:', tg.version);
      console.log('Telegram WebApp platform:', tg.platform);
      
      tg.ready();
      tg.expand();

      if (tg.themeParams?.bg_color) {
        document.body.style.backgroundColor = tg.themeParams.bg_color;
      }
      
      const rawInitData = tg.initData;
      const unsafeData = tg.initDataUnsafe;
      
      console.log('Raw initData length:', rawInitData?.length || 0);
      console.log('Unsafe data available:', !!unsafeData?.user);
      
      // Try unsafe data first
      if (unsafeData?.user) {
        console.log('Using unsafe data directly for user:', unsafeData.user.id);
        setUser(unsafeData.user);
        setCurrentUserId(unsafeData.user.id);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Try parsing initData
      if (rawInitData) {
        const parsedInitData = parseTelegramInitData(rawInitData);
        console.log('Parsed initData available:', !!parsedInitData);
        
        if (parsedInitData?.user) {
          setInitData(parsedInitData);
          setUser(parsedInitData.user);
          setCurrentUserId(parsedInitData.user.id);
          setError(null);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to mock user if no data available
      console.log('No user data available from Telegram, using mock user');
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null);
      setIsLoading(false);

    } catch (err) {
      console.error('Error initializing Telegram auth:', err);
      
      // Fallback to mock user on error
      console.log('Error occurred, using mock user for development');
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTelegramReady = () => {
      if (typeof window !== 'undefined') {
        if (window.Telegram?.WebApp) {
          initializeAuth();
        } else {
          // No Telegram WebApp available, use mock user
          console.log('No Telegram WebApp found, using mock user for development');
          const mockUser = createMockUser();
          setUser(mockUser);
          setCurrentUserId(mockUser.id);
          setIsTelegramEnvironment(false);
          setError(null);
          setIsLoading(false);
        }
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkTelegramReady);
    } else {
      checkTelegramReady();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', checkTelegramReady);
    };
  }, []);

  const refreshAuth = () => {
    console.log('Refreshing authentication...');
    initializeAuth();
  };

  return {
    user,
    initData,
    isLoading,
    error,
    isTelegramEnvironment,
    refreshAuth,
  };
}
