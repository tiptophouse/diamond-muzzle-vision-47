
import { useState, useEffect, useRef } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { TelegramUser } from '@/types/telegram';

export function useTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  // Function to log user login with IP address
  const logUserLogin = async (user: TelegramUser, tg?: any) => {
    try {
      console.log('📝 Logging user login for:', user.first_name, user.id);
      
      const loginData = {
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: tg?.initDataUnsafe?.user?.is_premium || false,
        photo_url: tg?.initDataUnsafe?.user?.photo_url,
        init_data_hash: tg?.initData ? btoa(tg.initData.substring(0, 50)) : undefined
      };

      const { data, error } = await supabase.functions.invoke('log-user-login', {
        body: loginData
      });

      if (error) {
        console.error('❌ Failed to log user login:', error);
      } else {
        console.log('✅ User login logged successfully:', data);
      }
    } catch (error) {
      console.error('❌ Error logging user login:', error);
    }
  };

  const initializeAuth = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting Telegram auth initialization...');
    
    try {
      // Check if we're in a Telegram environment
      const inTelegram = typeof window !== 'undefined' && 
        !!window.Telegram?.WebApp && 
        typeof window.Telegram.WebApp === 'object';
      
      console.log('📱 Telegram environment detected:', inTelegram);
      setIsTelegramEnvironment(inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        console.log('🔍 Telegram WebApp object:', tg);
        console.log('🔍 InitData available:', !!tg.initData);
        console.log('🔍 InitDataUnsafe:', tg.initDataUnsafe);
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp ready() and expand() called');
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed, continuing...', themeError);
        }
        
        // Try to get user data from initDataUnsafe
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          console.log('✅ Found user in initDataUnsafe:', tg.initDataUnsafe.user);
          const telegramUser = tg.initDataUnsafe.user;
          
          const authenticatedUser: TelegramUser = {
            id: telegramUser.id,
            first_name: telegramUser.first_name || 'User',
            last_name: telegramUser.last_name || '',
            username: telegramUser.username || '',
            language_code: telegramUser.language_code || 'en'
          };
          
          console.log('👤 Setting authenticated user:', authenticatedUser);
          setUser(authenticatedUser);
          setCurrentUserId(authenticatedUser.id);
          setIsAuthenticated(true);
          setError(null);
          
          // Log the login
          await logUserLogin(authenticatedUser, tg);
        } else {
          console.log('⚠️ No user data in initDataUnsafe, using fallback');
          // Use fallback user for development
          const fallbackUser: TelegramUser = {
            id: 2138564172,
            first_name: "Telegram",
            last_name: "User",
            username: "telegramuser",
            language_code: "en"
          };
          
          setUser(fallbackUser);
          setCurrentUserId(fallbackUser.id);
          setIsAuthenticated(true);
          setError(null);
          
          await logUserLogin(fallbackUser);
        }
      } else {
        // Not in Telegram environment - use development user
        console.log('🔧 Not in Telegram - using development user');
        const devUser: TelegramUser = {
          id: 2138564172,
          first_name: "Dev",
          last_name: "User", 
          username: "devuser",
          language_code: "en"
        };
        
        setUser(devUser);
        setCurrentUserId(devUser.id);
        setIsAuthenticated(true);
        setError(null);
        
        await logUserLogin(devUser);
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      // Set up a working user for development even on error
      const fallbackUser: TelegramUser = {
        id: 2138564172,
        first_name: "Fallback",
        last_name: "User",
        username: "fallbackuser", 
        language_code: "en"
      };
      
      setUser(fallbackUser);
      setCurrentUserId(fallbackUser.id);
      setIsAuthenticated(true);
      setError('Using fallback authentication');
      
      logUserLogin(fallbackUser).catch(console.error);
    } finally {
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Start initialization immediately
    initializeAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
  };
}
