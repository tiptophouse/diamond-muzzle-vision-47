
import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { TelegramUser } from '@/types/telegram';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

// This hook is deprecated in favor of useSecureAuth
// Maintained for backward compatibility only

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
        // Not in Telegram environment - restricted development access
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - limited admin access');
          try {
            const adminId = await getAdminTelegramId();
            const devUser: TelegramUser = {
              id: adminId || 0,
              first_name: "Dev",
              last_name: "Admin",
              username: "devadmin",
              language_code: "en"
            };
            
            setUser(devUser);
            setCurrentUserId(devUser.id);
            setIsAuthenticated(true);
            setError('Development mode - limited access');
          } catch (error) {
            throw new Error('Development access configuration failed');
          }
        } else {
          throw new Error('Production requires Telegram environment');
        }
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err);
      // Secure fallback - no automatic authentication in production
      if (process.env.NODE_ENV === 'development') {
        try {
          const adminId = await getAdminTelegramId();
          const fallbackUser: TelegramUser = {
            id: adminId || 0,
            first_name: "Fallback",
            last_name: "User", 
            username: "fallbackuser",
            language_code: "en"
          };
          
          setUser(fallbackUser);
          setCurrentUserId(fallbackUser.id);
          setIsAuthenticated(true);
          setError('Development fallback authentication');
        } catch (configError) {
          setError('Authentication configuration failed');
        }
      } else {
        setError('Authentication failed - please contact support');
      }
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
    } else {
      // Secure fallback - require proper configuration
      console.log('🔒 No user data available - authentication required');
      if (process.env.NODE_ENV === 'development') {
        try {
          const adminId = await getAdminTelegramId();
          const secureUser: TelegramUser = {
            id: adminId || 0,
            first_name: "Secure",
            last_name: "User",
            username: "secureuser",
            language_code: "en"
          };
          
          setUser(secureUser);
          setCurrentUserId(secureUser.id);
          setIsAuthenticated(true);
          setError('Development mode with secure fallback');
        } catch (error) {
          setError('Secure authentication configuration required');
        }
      } else {
        setError('Authentication required - invalid session');
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Auth initialization timeout - secure mode');
        setError('Authentication timeout - please refresh and try again');
        setIsLoading(false);
        initializedRef.current = true;
        // No automatic user creation on timeout - force proper auth
      }
    }, 10000); // Increased timeout for security operations

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
