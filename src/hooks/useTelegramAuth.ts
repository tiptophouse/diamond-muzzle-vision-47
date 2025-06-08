
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
        console.log('🔍 InitDataUnsafe available:', !!tg.initDataUnsafe);
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp ready() and expand() called');
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed, continuing...', themeError);
        }
        
        // Try to get user data from multiple sources
        let telegramUser: TelegramUser | null = null;
        
        // Priority 1: Use initDataUnsafe if available (most reliable)
        if (tg.initDataUnsafe?.user) {
          const unsafeUser = tg.initDataUnsafe.user;
          if (unsafeUser.id && unsafeUser.first_name) {
            console.log('✅ Found user data from initDataUnsafe:', unsafeUser);
            telegramUser = {
              id: unsafeUser.id,
              first_name: unsafeUser.first_name,
              last_name: unsafeUser.last_name || '',
              username: unsafeUser.username || '',
              language_code: unsafeUser.language_code || 'en'
            };
          }
        }
        
        // Priority 2: Parse initData if no unsafe user found
        if (!telegramUser && tg.initData && tg.initData.length > 0) {
          console.log('🔍 Attempting to parse initData...');
          const parsedInitData = parseTelegramInitData(tg.initData);
          if (parsedInitData?.user) {
            console.log('✅ Found user data from parsed initData:', parsedInitData.user);
            telegramUser = parsedInitData.user;
          }
        }

        if (telegramUser) {
          console.log('👤 Setting Telegram user:', telegramUser);
          setUser(telegramUser);
          setCurrentUserId(telegramUser.id);
          setIsAuthenticated(true);
          setError(null);
          
          // Optional: Try backend verification in background (don't block on failure)
          if (tg.initData && tg.initData.length > 0) {
            try {
              const verificationResult = await verifyTelegramUser(tg.initData);
              if (verificationResult && verificationResult.success) {
                console.log('✅ Backend verification successful');
              } else {
                console.warn('⚠️ Backend verification failed, but continuing with local auth');
              }
            } catch (verifyError) {
              console.warn('⚠️ Backend verification error, but continuing with local auth:', verifyError);
            }
          }
        } else {
          console.error('❌ No valid user data found in Telegram WebApp');
          setError('No valid Telegram user data available');
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
