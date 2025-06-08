
import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { TelegramUser } from '@/types/telegram';
import { parseTelegramInitData, validateTelegramInitData } from '@/utils/telegramValidation';

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

    console.log('🔄 Starting Telegram auth initialization with initData validation...');
    
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
        
        // STRICT initData validation - only proceed with valid initData
        if (tg.initData && tg.initData.length > 0) {
          console.log('🔐 Validating initData...');
          
          // Parse and validate initData
          const parsedData = parseTelegramInitData(tg.initData);
          const isValidData = validateTelegramInitData(tg.initData);
          
          if (!parsedData || !parsedData.user || !isValidData) {
            console.error('❌ Invalid or missing initData - authentication failed');
            setError('Invalid Telegram authentication data. Please ensure you are accessing this app through Telegram.');
            setIsAuthenticated(false);
            setIsLoading(false);
            initializedRef.current = true;
            return;
          }
          
          console.log('✅ InitData validation successful');
          
          // Try to verify with backend
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ Backend verification successful:', verificationResult);
            
            const verifiedUser: TelegramUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || parsedData.user.first_name,
              last_name: verificationResult.user_data?.last_name || parsedData.user.last_name,
              username: verificationResult.user_data?.username || parsedData.user.username,
              language_code: verificationResult.user_data?.language_code || parsedData.user.language_code || 'en'
            };
            
            console.log('👤 Setting verified user:', verifiedUser);
            setUser(verifiedUser);
            setCurrentUserId(verificationResult.user_id);
            setIsAuthenticated(true);
            setError(null);
          } else {
            console.error('❌ Backend verification failed');
            setError('Failed to verify your Telegram authentication with our servers.');
            setIsAuthenticated(false);
          }
        } else {
          console.error('❌ No initData available - authentication denied');
          setError('No authentication data available. Please ensure you are accessing this app through the official Telegram application.');
          setIsAuthenticated(false);
        }
      } else {
        // Not in Telegram environment - deny access in production
        if (process.env.NODE_ENV === 'production') {
          console.log('❌ Production mode requires Telegram environment');
          setError('This application must be accessed through Telegram.');
          setIsAuthenticated(false);
        } else {
          // Development mode fallback
          console.log('🔧 Development mode - using fallback user');
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
        }
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      setError('Authentication failed. Please try again.');
      setIsAuthenticated(false);
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
        setError('Authentication timeout. Please refresh and try again.');
        setIsLoading(false);
        initializedRef.current = true;
      }
    }, 10000); // Increased timeout for validation

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
