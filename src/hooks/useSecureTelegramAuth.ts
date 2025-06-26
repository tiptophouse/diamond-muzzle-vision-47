
import { useState, useEffect, useRef } from 'react';
import { 
  isTelegramWebAppEnvironment,
  getTelegramWebApp,
  parseTelegramInitData,
  validateTelegramInitData,
  initializeTelegramWebApp
} from '@/utils/telegramWebApp';
import { verifyTelegramUser } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';

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

export function useSecureTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const authAttempts = useRef(0);
  const maxAuthAttempts = 3;

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const logSecurityEvent = (event: string, details: any) => {
    console.log(`🛡️ Security Event: ${event}`, {
      ...details,
      timestamp: new Date().toISOString(),
      attempt: authAttempts.current
    });
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current || authAttempts.current >= maxAuthAttempts) {
      return;
    }

    authAttempts.current++;
    console.log('🔐 Starting secure Telegram authentication (attempt', authAttempts.current, ')');
    
    try {
      // Check if we're in Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp initialized');
        } catch (themeError) {
          console.warn('⚠️ WebApp setup failed, continuing...', themeError);
        }
        
        // Debug: Log available data
        console.log('🔍 Telegram WebApp initData:', tg.initData ? 'Available' : 'Missing');
        console.log('🔍 Telegram WebApp initDataUnsafe:', tg.initDataUnsafe);
        
        // Try to get real user data from initData
        if (tg.initData && tg.initData.length > 0) {
          console.log('🔐 Found initData, verifying with backend...');
          
          const verificationResult = await verifyTelegramUser(tg.initData);
          
          if (verificationResult && verificationResult.success && verificationResult.user_id) {
            console.log('✅ Backend verification successful:', verificationResult);
            
            const verifiedUser: TelegramUser = {
              id: verificationResult.user_id,
              first_name: verificationResult.user_data?.first_name || 'User',
              last_name: verificationResult.user_data?.last_name || '',
              username: verificationResult.user_data?.username || '',
              language_code: verificationResult.user_data?.language_code || 'en'
            };
            
            console.log('👤 Setting verified user from InitData:', verifiedUser);
            setCurrentUserId(verificationResult.user_id);
            
            logSecurityEvent('Telegram InitData Verified', {
              userId: verificationResult.user_id,
              firstName: verifiedUser.first_name,
              securityInfo: verificationResult.security_info
            });
            
            updateState({
              user: verifiedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            initializedRef.current = true;
            return;
          } else {
            console.error('❌ Backend verification failed, trying unsafe data...');
          }
        }
        
        // Fallback to initDataUnsafe if verification fails
        if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
          console.log('⚠️ Using initDataUnsafe as fallback');
          const unsafeUser = tg.initDataUnsafe.user;
          
          const fallbackUser: TelegramUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name || 'User',
            last_name: unsafeUser.last_name || '',
            username: unsafeUser.username || '',
            language_code: unsafeUser.language_code || 'en'
          };
          
          setCurrentUserId(fallbackUser.id);
          
          logSecurityEvent('Telegram Unsafe Data Used', {
            userId: fallbackUser.id,
            firstName: fallbackUser.first_name,
            warning: 'Using unverified Telegram data'
          });
          
          updateState({
            user: fallbackUser,
            isAuthenticated: true,
            isLoading: false,
            error: 'Using unverified Telegram data'
          });
          initializedRef.current = true;
          return;
        }
        
        console.error('❌ No valid Telegram user data found');
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'No valid Telegram user data found'
        });
        
      } else {
        console.log('❌ Not in Telegram environment - authentication failed');
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'This app must be accessed through Telegram'
        });
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      logSecurityEvent('Authentication Error', {
        error: error instanceof Error ? error.message : 'Unknown',
        attempt: authAttempts.current
      });
      
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        
        logSecurityEvent('Authentication Timeout', {
          attempts: authAttempts.current,
          maxAttempts: maxAuthAttempts
        });
        
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication timeout - please refresh the app'
        });
        initializedRef.current = true;
      }
    }, 5000);

    // Start authentication
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
