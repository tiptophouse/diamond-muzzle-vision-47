
import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
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
        console.log('🔍 InitData length:', tg.initData?.length || 0);
        console.log('🔍 InitDataUnsafe:', tg.initDataUnsafe);
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp ready() and expand() called');
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed, continuing...', themeError);
        }
        
        // Try to get real user data from initData first
        if (tg.initData && tg.initData.length > 0) {
          console.log('🔐 Found initData, verifying with backend...');
          
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ Backend verification successful:', verificationResult);
            
            const verifiedUser: TelegramUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || 'User',
              last_name: verificationResult.user_data?.last_name || '',
              username: verificationResult.user_data?.username || '',
              language_code: verificationResult.user_data?.language_code || 'en'
            };
            
            console.log('👤 Setting verified user:', verifiedUser);
            setUser(verifiedUser);
            setCurrentUserId(verificationResult.user_id);
            setIsAuthenticated(true);
            setError(null);
            
            // Log the login with IP address
            await logUserLogin(verifiedUser, tg);
          } else {
            console.error('❌ Backend verification failed, falling back...');
            // Fall back to using initDataUnsafe or hardcoded user
            await handleFallbackAuth(tg);
          }
        } else {
          console.warn('⚠️ No initData available, using fallback auth');
          await handleFallbackAuth(tg);
        }
      } else {
        // Not in Telegram environment - use development user
        console.log('🔧 Not in Telegram - using development user');
        const devUser: TelegramUser = {
          id: 2138564172, // Your specific user ID
          first_name: "Dev",
          last_name: "User",
          username: "devuser",
          language_code: "en"
        };
        
        setUser(devUser);
        setCurrentUserId(devUser.id);
        setIsAuthenticated(true);
        setError(null);
        
        // Log the login with IP address
        await logUserLogin(devUser);
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      // Even on error, set up a working user for development
      const fallbackUser: TelegramUser = {
        id: 2138564172, // Your specific user ID
        first_name: "Fallback",
        last_name: "User",
        username: "fallbackuser",
        language_code: "en"
      };
      
      setUser(fallbackUser);
      setCurrentUserId(fallbackUser.id);
      setIsAuthenticated(true);
      setError('Using fallback authentication');
      
      // Log the fallback login with IP address
      logUserLogin(fallbackUser).catch(console.error);
    } finally {
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  const handleFallbackAuth = async (tg: any) => {
    // Try initDataUnsafe first
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      console.log('⚠️ Using initDataUnsafe for auth');
      const unsafeUser = tg.initDataUnsafe.user;
      
      const fallbackUser: TelegramUser = {
        id: unsafeUser.id,
        first_name: unsafeUser.first_name || 'User',
        last_name: unsafeUser.last_name || '',
        username: unsafeUser.username || '',
        language_code: unsafeUser.language_code || 'en'
      };
      
      setUser(fallbackUser);
      setCurrentUserId(fallbackUser.id);
      setIsAuthenticated(true);
      setError(null);
      
      // Log the login with IP address
      await logUserLogin(fallbackUser, tg);
    } else {
      // Use your specific user ID as ultimate fallback
      console.log('🆘 Using hardcoded user ID for auth');
      const hardcodedUser: TelegramUser = {
        id: 2138564172, // Your specific user ID
        first_name: "Telegram",
        last_name: "User",
        username: "telegramuser",
        language_code: "en"
      };
      
      setUser(hardcodedUser);
      setCurrentUserId(hardcodedUser.id);
      setIsAuthenticated(true);
      setError(null);
      
      // Log the login with IP address  
      await logUserLogin(hardcodedUser);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout - using emergency user');
        const emergencyUser: TelegramUser = {
          id: 2138564172, // Your specific user ID
          first_name: "Emergency",
          last_name: "User",
          username: "emergencyuser",
          language_code: "en"
        };
        
        setUser(emergencyUser);
        setCurrentUserId(emergencyUser.id);
        setIsAuthenticated(true);
        setError('Authentication timeout - using emergency user');
        setIsLoading(false);
        initializedRef.current = true;
        
        // Log the emergency login with IP address
        logUserLogin(emergencyUser).catch(console.error);
      }
    }, 5000);

    // Start initialization after a brief delay
    const initTimer = setTimeout(() => {
      initializeAuth();
    }, 200);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimer);
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
