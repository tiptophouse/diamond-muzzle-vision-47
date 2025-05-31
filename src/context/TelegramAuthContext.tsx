import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { parseTelegramInitData, validateTelegramInitData, isTelegramWebApp, TelegramInitData } from '@/utils/telegramValidation';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          query_id?: string;
          auth_date?: number;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshAuth: () => void;
  initData: TelegramInitData | null;
  isTelegramEnvironment: boolean;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
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
      
      // Check if we're in a Telegram environment
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
      
      // Initialize Telegram WebApp
      tg.ready();
      tg.expand();

      // Configure theme
      if (tg.themeParams?.bg_color) {
        document.body.style.backgroundColor = tg.themeParams.bg_color;
      }
      
      // Get initData - try both sources
      const rawInitData = tg.initData;
      const unsafeData = tg.initDataUnsafe;
      
      console.log('Raw initData:', rawInitData);
      console.log('Unsafe data:', unsafeData);
      
      // If we have unsafe data but no initData, use unsafe data directly
      if (!rawInitData && unsafeData?.user) {
        console.log('Using unsafe data directly');
        setUser(unsafeData.user);
        setCurrentUserId(unsafeData.user.id);
        setIsLoading(false);
        return;
      }

      if (!rawInitData) {
        console.log('No initData available');
        setError('No initialization data received from Telegram. Please restart the app.');
        setIsLoading(false);
        return;
      }

      // Parse initData
      const parsedInitData = parseTelegramInitData(rawInitData);
      console.log('Parsed initData:', parsedInitData);
      
      if (!parsedInitData) {
        console.log('Failed to parse initData, trying unsafe data');
        if (unsafeData?.user) {
          setUser(unsafeData.user);
          setCurrentUserId(unsafeData.user.id);
          setIsLoading(false);
          return;
        }
        setError('Invalid initialization data format.');
        setIsLoading(false);
        return;
      }

      setInitData(parsedInitData);

      // Get user data
      const telegramUser = parsedInitData.user || unsafeData?.user;
      
      if (!telegramUser) {
        setError('User data not available. Please ensure you have authorized the bot.');
        setIsLoading(false);
        return;
      }

      // Set authenticated user
      setUser(telegramUser);
      setCurrentUserId(telegramUser.id);
      
      console.log('Telegram user authenticated:', telegramUser);
      console.log('Telegram WebApp version:', tg.version);

    } catch (err) {
      console.error('Error initializing Telegram auth:', err);
      setError('Failed to initialize Telegram authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for Telegram script to load
    const checkTelegramReady = () => {
      if (typeof window !== 'undefined') {
        if (window.Telegram?.WebApp) {
          initializeAuth();
        } else {
          // Not in Telegram environment
          setIsTelegramEnvironment(false);
          setError('This app must be opened through Telegram.');
          setIsLoading(false);
        }
      }
    };

    // Check immediately or wait for script to load
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
    initializeAuth();
  };

  const isAuthenticated = !!user && isTelegramEnvironment;

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        refreshAuth,
        initData,
        isTelegramEnvironment,
      }}
    >
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}
