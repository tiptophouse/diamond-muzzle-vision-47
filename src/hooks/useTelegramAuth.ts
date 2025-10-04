
import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { TelegramUser } from '@/types/telegram';
import { toast } from 'sonner';

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
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp ready() and expand() called');
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed, continuing...', themeError);
        }
        
        // PRODUCTION SAFE: Check for initData (no unsafe fallback)
        if (!tg.initData || !tg.initData.length) {
          console.error('❌ LEGACY AUTH: Missing Telegram initData - PRODUCTION SAFE CHECK');
          
          toast.error('Authentication data missing. Please restart the app from Telegram.');
          
          setError('Missing Telegram authentication data');
          setIsLoading(false);
          return;
        }

        console.log('🔐 Found initData, verifying with backend...');
        // Use SetError to show debug data in telegram web app
        setError(tg.initData);
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
          console.error('❌ Backend verification failed');
          
          toast.error('Authentication failed. Please try again.');
          // Temporary comment to not overwrite debug info
          // setError('Backend authentication failed');
          setIsLoading(false);
          return;
        }
      } else {
        // Not in Telegram environment - show appropriate error
        console.log('🔧 Not in Telegram environment');
        
        toast.error('This app only works inside Telegram Mini App.');
        
        setError('This app only works inside Telegram');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Authentication system error';
      
      toast.error(`Authentication failed: ${errorMessage}`);
      
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout');
        
        toast.error('Authentication timeout. Please refresh the app.');
        
        setError('Authentication timeout');
        setIsLoading(false);
        initializedRef.current = true;
      }
    }, 10000);

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
