
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
    // Use one of the actual user IDs from the API data for development
    return {
      id: 2138564172, // Using a real user ID from the API data
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
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('Not in browser environment, using mock user');
        const mockUser = createMockUser();
        setUser(mockUser);
        setCurrentUserId(mockUser.id);
        setIsTelegramEnvironment(false);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Wait for Telegram script to be fully loaded
      const maxWaitTime = 3000; // Reduced to 3 seconds
      const checkInterval = 100; // 100ms
      let waitTime = 0;

      const checkTelegramScript = () => {
        if (window.Telegram && window.Telegram.WebApp) {
          console.log('Telegram script loaded successfully');
          proceedWithTelegramInit();
        } else if (waitTime < maxWaitTime) {
          waitTime += checkInterval;
          setTimeout(checkTelegramScript, checkInterval);
        } else {
          console.log('Telegram script timeout, using mock user for development');
          fallbackToMockUser();
        }
      };

      checkTelegramScript();

    } catch (err) {
      console.error('Error initializing Telegram auth:', err);
      fallbackToMockUser();
    }
  };

  const proceedWithTelegramInit = () => {
    try {
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);
      console.log('Is in Telegram environment:', inTelegram);

      if (!inTelegram || !window.Telegram.WebApp) {
        console.log('Not in Telegram environment, using mock user for development');
        fallbackToMockUser();
        return;
      }

      const tg = window.Telegram.WebApp;
      console.log('Telegram WebApp object:', tg);
      
      // Safely initialize WebApp
      try {
        if (typeof tg.ready === 'function') {
          tg.ready();
        }
        
        if (typeof tg.expand === 'function') {
          tg.expand();
        }

        // Apply theme with error handling
        if (tg.themeParams?.bg_color) {
          try {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          } catch (err) {
            console.warn('Could not apply Telegram theme:', err);
          }
        }
      } catch (err) {
        console.warn('Error during WebApp initialization:', err);
      }
      
      const rawInitData = tg.initData;
      const unsafeData = tg.initDataUnsafe;
      
      console.log('Raw initData available:', !!rawInitData);
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

      // If no data available from Telegram, use mock user
      console.log('No user data available from Telegram, using mock user for development');
      fallbackToMockUser();

    } catch (err) {
      console.error('Error in Telegram initialization:', err);
      fallbackToMockUser();
    }
  };

  const fallbackToMockUser = () => {
    console.log('Falling back to mock user for development');
    const mockUser = createMockUser();
    setUser(mockUser);
    setCurrentUserId(mockUser.id);
    setError(null);
    setIsLoading(false);
    setIsTelegramEnvironment(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const delayedInit = () => {
      // Add a small delay to ensure DOM is ready
      timeoutId = setTimeout(() => {
        initializeAuth();
      }, 100); // Reduced delay
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', delayedInit);
    } else {
      delayedInit();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener('DOMContentLoaded', delayedInit);
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
