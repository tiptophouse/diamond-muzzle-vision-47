
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
      // Check if we're in a Telegram environment
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);

      if (!inTelegram) {
        setError('This app can only be used within Telegram. Please open it through a Telegram bot or Mini App.');
        setIsLoading(false);
        return;
      }

      const tg = window.Telegram!.WebApp;
      
      // Initialize Telegram WebApp
      tg.ready();
      tg.expand();

      // Configure theme
      document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
      
      // Get and validate initData
      const rawInitData = tg.initData;
      
      if (!rawInitData) {
        setError('No initialization data received from Telegram. Please restart the app.');
        setIsLoading(false);
        return;
      }

      console.log('Raw Telegram initData:', rawInitData);

      // Parse initData
      const parsedInitData = parseTelegramInitData(rawInitData);
      
      if (!parsedInitData) {
        setError('Invalid initialization data format.');
        setIsLoading(false);
        return;
      }

      setInitData(parsedInitData);

      // Validate auth_date (not older than 24 hours)
      const authDate = parsedInitData.auth_date;
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = currentTime - authDate;
      
      if (timeDiff > 86400) { // 24 hours in seconds
        setError('Session expired. Please restart the app.');
        setIsLoading(false);
        return;
      }

      // Get user data
      const telegramUser = parsedInitData.user || tg.initDataUnsafe?.user;
      
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
      console.log('Platform:', tg.platform);

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
