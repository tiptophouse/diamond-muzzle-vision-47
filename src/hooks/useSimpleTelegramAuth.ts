
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
}

const ADMIN_TELEGRAM_ID = 2138564172;

export function useSimpleTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const createAdminUser = (): TelegramUser => {
    return {
      id: ADMIN_TELEGRAM_ID,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      language_code: "en"
    };
  };

  const verifyWithBackend = async (initData: string): Promise<TelegramUser | null> => {
    try {
      console.log('🔐 Verifying initData with backend...');
      
      const { data, error } = await supabase.functions.invoke('verify-telegram-init-data', {
        body: { initData }
      });

      if (error) {
        console.error('❌ Backend verification error:', error);
        return null;
      }

      if (data?.success && data?.user) {
        console.log('✅ Backend verification successful');
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('❌ Backend verification failed:', error);
      return null;
    }
  };

  const parseUserFromInitDataUnsafe = (tg: any): TelegramUser | null => {
    try {
      const user = tg.initDataUnsafe?.user;
      if (!user || !user.id || !user.first_name) {
        return null;
      }

      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code || 'en',
        is_premium: user.is_premium,
        photo_url: user.photo_url
      };
    } catch (error) {
      console.error('❌ Failed to parse user from initDataUnsafe:', error);
      return null;
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting Telegram authentication...');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = typeof window !== 'undefined' && 
        !!window.Telegram?.WebApp && 
        typeof window.Telegram.WebApp === 'object';
      
      console.log('📱 Telegram environment:', inTelegram);
      updateState({ isTelegramEnvironment: inTelegram });

      if (!inTelegram) {
        // Development mode - allow admin access only
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - providing admin access');
          const adminUser = createAdminUser();
          updateState({
            user: adminUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          initializedRef.current = true;
          return;
        } else {
          // Production without Telegram environment
          console.log('❌ Production environment requires Telegram WebApp');
          updateState({
            error: 'This app must be accessed through Telegram',
            isLoading: false
          });
          initializedRef.current = true;
          return;
        }
      }

      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
      } catch (error) {
        console.warn('⚠️ WebApp setup failed:', error);
      }

      console.log('📱 Telegram WebApp initialized:', {
        hasInitData: !!tg.initData,
        initDataLength: tg.initData?.length || 0,
        hasInitDataUnsafe: !!tg.initDataUnsafe?.user
      });

      let authenticatedUser: TelegramUser | null = null;

      // Primary: Try initData with backend verification
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔐 Attempting backend verification...');
        authenticatedUser = await verifyWithBackend(tg.initData);
        
        if (authenticatedUser) {
          console.log('✅ User authenticated via backend verification');
        } else {
          console.log('⚠️ Backend verification failed, trying fallback...');
        }
      }

      // Fallback: Use initDataUnsafe (development/testing only)
      if (!authenticatedUser && process.env.NODE_ENV === 'development') {
        console.log('🔄 Trying initDataUnsafe fallback...');
        authenticatedUser = parseUserFromInitDataUnsafe(tg);
        
        if (authenticatedUser) {
          console.log('⚠️ Using unverified user data from initDataUnsafe');
        }
      }

      // If still no user and we're admin, allow access
      if (!authenticatedUser && process.env.NODE_ENV === 'development') {
        console.log('🔧 No user data found, using admin fallback');
        authenticatedUser = createAdminUser();
      }

      if (authenticatedUser) {
        console.log('✅ Authentication successful:', authenticatedUser.first_name);
        updateState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        console.log('❌ Authentication failed');
        updateState({
          error: 'Authentication failed - invalid or missing user data',
          isLoading: false
        });
      }

    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        error: 'Authentication error occurred',
        isLoading: false
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          error: 'Authentication timeout',
          isLoading: false
        });
        initializedRef.current = true;
      }
    }, 5000);

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
