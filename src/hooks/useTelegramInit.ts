
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

  const initializeAuth = () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting Telegram auth initialization...');
      
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);
      console.log('Is in Telegram environment:', inTelegram);

      if (!inTelegram) {
        console.log('Not in Telegram environment');
        setError('This app can only be used within Telegram. Please open it through a Telegram bot or Mini App.');
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
      
      if (!rawInitData && unsafeData?.user) {
        console.log('Using unsafe data directly for user:', unsafeData.user.id);
        setUser(unsafeData.user);
        setCurrentUserId(unsafeData.user.id);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (!rawInitData) {
        console.log('No initData available, checking if we have any user data');
        if (unsafeData?.user) {
          console.log('Found user in unsafe data, using that');
          setUser(unsafeData.user);
          setCurrentUserId(unsafeData.user.id);
          setError(null);
        } else {
          setError('No user data available from Telegram. Please restart the app.');
        }
        setIsLoading(false);
        return;
      }

      const parsedInitData = parseTelegramInitData(rawInitData);
      console.log('Parsed initData available:', !!parsedInitData);
      
      if (!parsedInitData) {
        console.log('Failed to parse initData, trying unsafe data');
        if (unsafeData?.user) {
          setUser(unsafeData.user);
          setCurrentUserId(unsafeData.user.id);
          setError(null);
          setIsLoading(false);
          return;
        }
        setError('Invalid initialization data format.');
        setIsLoading(false);
        return;
      }

      setInitData(parsedInitData);

      const telegramUser = parsedInitData.user || unsafeData?.user;
      
      if (!telegramUser) {
        setError('User data not available. Please ensure you have authorized the bot.');
        setIsLoading(false);
        return;
      }

      setUser(telegramUser);
      setCurrentUserId(telegramUser.id);
      setError(null);
      
      console.log('Telegram user authenticated successfully:', telegramUser.id, telegramUser.first_name);

    } catch (err) {
      console.error('Error initializing Telegram auth:', err);
      setError('Failed to initialize Telegram authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTelegramReady = () => {
      if (typeof window !== 'undefined') {
        if (window.Telegram?.WebApp) {
          initializeAuth();
        } else {
          setIsTelegramEnvironment(false);
          setError('This app must be opened through Telegram.');
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
