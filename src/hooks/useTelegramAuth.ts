
import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { TelegramUser } from '@/types/telegram';
import { validateTelegramInitData, parseTelegramInitData } from '@/utils/telegramValidation';

export function useTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const initializeAuth = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting strict Telegram auth initialization...');
    
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
        
        // Validate initData first
        if (!tg.initData || tg.initData.length === 0) {
          console.error('❌ No initData available - authentication required');
          setError('No Telegram authentication data available');
          setIsLoading(false);
          initializedRef.current = true;
          return;
        }

        // Validate the initData signature
        const isValidInitData = validateTelegramInitData(tg.initData);
        if (!isValidInitData) {
          console.error('❌ Invalid Telegram initData signature');
          setError('Invalid Telegram authentication data');
          setIsLoading(false);
          initializedRef.current = true;
          return;
        }

        console.log('✅ Valid initData detected, parsing user data...');
        
        // Parse the validated initData
        const parsedInitData = parseTelegramInitData(tg.initData);
        if (!parsedInitData || !parsedInitData.user) {
          console.error('❌ Failed to parse user data from initData');
          setError('Failed to parse user authentication data');
          setIsLoading(false);
          initializedRef.current = true;
          return;
        }

        const telegramUser = parsedInitData.user;
        console.log('✅ Parsed Telegram user:', telegramUser.id, telegramUser.first_name);

        // Verify with backend
        try {
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ Backend verification successful:', verificationResult);
            
            const verifiedUser: TelegramUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || telegramUser.first_name,
              last_name: verificationResult.user_data?.last_name || telegramUser.last_name || '',
              username: verificationResult.user_data?.username || telegramUser.username || '',
              language_code: verificationResult.user_data?.language_code || telegramUser.language_code || 'en'
            };
            
            console.log('👤 Setting verified user:', verifiedUser);
            setUser(verifiedUser);
            setCurrentUserId(verificationResult.user_id);
            setIsAuthenticated(true);
            setError(null);
          } else {
            console.error('❌ Backend verification failed');
            setError('Authentication verification failed');
          }
        } catch (verifyError) {
          console.error('❌ Backend verification error:', verifyError);
          setError('Authentication service unavailable');
        }
      } else {
        // Not in Telegram environment
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - using test user');
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
        } else {
          console.log('❌ Production requires Telegram environment');
          setError('This app must be accessed through Telegram');
        }
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      setError('Authentication initialization failed');
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
        setError('Authentication timeout');
        setIsLoading(false);
        initializedRef.current = true;
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
