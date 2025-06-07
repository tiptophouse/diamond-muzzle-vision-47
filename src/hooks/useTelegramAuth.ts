
import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { TelegramUser } from '@/types/telegram';

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
      console.log('📱 Window.Telegram:', !!window.Telegram);
      console.log('📱 Window.Telegram.WebApp:', !!window.Telegram?.WebApp);
      setIsTelegramEnvironment(inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        console.log('🔍 Telegram WebApp object:', tg);
        console.log('🔍 InitData available:', !!tg.initData);
        console.log('🔍 InitData length:', tg.initData?.length || 0);
        console.log('🔍 InitData content (first 100 chars):', tg.initData?.substring(0, 100) || 'EMPTY');
        console.log('🔍 InitDataUnsafe:', tg.initDataUnsafe);
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp ready() and expand() called');
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed, continuing...', themeError);
        }
        
        // Get initData and verify with backend
        if (tg.initData && tg.initData.length > 0) {
          console.log('🔐 Found initData, verifying with backend...');
          console.log('🔐 Sending initData to mazalbot.app/api/v1/verify-telegram');
          
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            console.log('✅ Backend verification successful:', verificationResult);
            
            // Create user object from verification result
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
          } else {
            console.error('❌ Backend verification failed:', verificationResult);
            setError('Failed to verify Telegram user with backend');
            setIsAuthenticated(false);
          }
        } else if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          // Fallback to initDataUnsafe if initData is not available (development/testing)
          console.warn('⚠️ No initData, using initDataUnsafe for development');
          const unsafeUser = tg.initDataUnsafe.user;
          
          const fallbackUser: TelegramUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name || 'User',
            last_name: unsafeUser.last_name || '',
            username: unsafeUser.username || '',
            language_code: unsafeUser.language_code || 'en'
          };
          
          console.log('👤 Using fallback user from initDataUnsafe:', fallbackUser);
          setUser(fallbackUser);
          setCurrentUserId(fallbackUser.id);
          setIsAuthenticated(true);
          setError(null);
        } else {
          console.warn('⚠️ No initData and no initDataUnsafe available');
          setError('No Telegram initialization data available');
          setIsAuthenticated(false);
        }
      } else {
        // Development mode fallback
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - using mock user');
          const mockUser: TelegramUser = {
            id: 2138564172,
            first_name: "Dev",
            last_name: "User",
            username: "devuser",
            language_code: "en"
          };
          
          setUser(mockUser);
          setCurrentUserId(mockUser.id);
          setIsAuthenticated(true);
          setError(null);
        } else {
          console.log('❌ Production environment requires Telegram WebApp');
          setError('This app must be accessed through Telegram');
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      setError('Authentication initialization failed');
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
        setError('Authentication timeout');
        setIsLoading(false);
        initializedRef.current = true;
      }
    }, 10000);

    // Wait a bit for Telegram WebApp to fully initialize
    const initTimer = setTimeout(() => {
      initializeAuth();
    }, 500);

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
