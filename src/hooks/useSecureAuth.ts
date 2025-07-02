import { useState, useEffect, useRef } from 'react';
import { verifyTelegramUser, setCurrentUserId } from '@/lib/api';
import { TelegramUser } from '@/types/telegram';
import { getAdminTelegramId } from '@/lib/api/secureConfig';

interface SecurityMetrics {
  authAttempts: number;
  lastAttempt: Date | null;
  securityLevel: 'high' | 'medium' | 'low';
}

export function useSecureAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    authAttempts: 0,
    lastAttempt: null,
    securityLevel: 'low'
  });
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const maxAuthAttempts = 3;
  const lockoutDuration = 5 * 60 * 1000; // 5 minutes

  const isLockedOut = () => {
    if (securityMetrics.authAttempts >= maxAuthAttempts && securityMetrics.lastAttempt) {
      return Date.now() - securityMetrics.lastAttempt.getTime() < lockoutDuration;
    }
    return false;
  };

  const recordAuthAttempt = (success: boolean) => {
    setSecurityMetrics(prev => ({
      ...prev,
      authAttempts: success ? 0 : prev.authAttempts + 1,
      lastAttempt: new Date(),
      securityLevel: success ? 'high' : (prev.authAttempts >= 2 ? 'low' : 'medium')
    }));
  };

  const initializeSecureAuth = async () => {
    if (initializedRef.current || !mountedRef.current || isLockedOut()) {
      if (isLockedOut()) {
        setError('Too many authentication attempts. Please wait before trying again.');
        setIsLoading(false);
      }
      return;
    }

    console.log('🔐 Starting secure authentication...');
    
    try {
      // Environment security check
      const inTelegram = typeof window !== 'undefined' && 
        !!window.Telegram?.WebApp && 
        typeof window.Telegram.WebApp === 'object';
      
      setIsTelegramEnvironment(inTelegram);

      // Production environment restrictions
      if (process.env.NODE_ENV === 'production' && !inTelegram) {
        setError('Production access requires Telegram environment');
        setIsLoading(false);
        recordAuthAttempt(false);
        return;
      }

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed:', themeError);
        }
        
        // Secure authentication with backend verification
        if (tg.initData && tg.initData.length > 0) {
          console.log('🔐 Attempting secure backend verification...');
          
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success) {
            const verifiedUser: TelegramUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || 'User',
              last_name: verificationResult.user_data?.last_name || '',
              username: verificationResult.user_data?.username || '',
              language_code: verificationResult.user_data?.language_code || 'en'
            };
            
            setUser(verifiedUser);
            setCurrentUserId(verificationResult.user_id);
            setIsAuthenticated(true);
            setError(null);
            recordAuthAttempt(true);
            
            console.log('✅ Secure authentication successful');
          } else {
            throw new Error('Backend verification failed');
          }
        } else {
          throw new Error('No secure initData available');
        }
      } else {
        // Development mode with security restrictions
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - limited access');
          
          // Only allow admin access in development without Telegram
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
          setError('Development mode active');
          recordAuthAttempt(true);
        } else {
          throw new Error('Secure authentication required');
        }
      }
    } catch (err) {
      console.error('❌ Secure authentication failed:', err);
      setError('Authentication failed. Please try again.');
      recordAuthAttempt(false);
    } finally {
      setIsLoading(false);
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        setError('Authentication timeout');
        setIsLoading(false);
        recordAuthAttempt(false);
      }
    }, 10000); // Increased timeout for secure operations

    initializeSecureAuth();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const retryAuth = () => {
    if (isLockedOut()) {
      setError('Please wait before retrying authentication');
      return;
    }
    
    initializedRef.current = false;
    setIsLoading(true);
    setError(null);
    initializeSecureAuth();
  };

  return {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
    securityMetrics,
    isLockedOut: isLockedOut(),
    retryAuth,
  };
}