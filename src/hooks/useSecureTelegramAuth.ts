
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { telegramAuthService, TelegramAuthResponse } from '@/services/telegramAuth';
import { setCurrentUserId } from '@/lib/api/config';
import { toast } from 'sonner';

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
}

export function useSecureTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    isTelegramEnvironment: false,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const isTelegramWebAppEnvironment = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.Telegram?.WebApp && 
      typeof window.Telegram.WebApp === 'object'
    );
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting secure Telegram authentication...');
    
    try {
      const isTelegramEnv = isTelegramWebAppEnvironment();
      updateState({ isTelegramEnvironment: isTelegramEnv });

      if (!isTelegramEnv) {
        // Development fallback - only for testing
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode - using fallback auth');
          const devUser: TelegramUser = {
            id: 2138564172,
            first_name: 'Admin',
            last_name: 'User',
            username: 'admin',
            language_code: 'en'
          };
          
          setCurrentUserId(devUser.id);
          updateState({
            user: devUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          initializedRef.current = true;
          return;
        } else {
          throw new Error('This app must be accessed through Telegram Mini App');
        }
      }

      const tg = window.Telegram!.WebApp;
      
      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization warning:', error);
      }

      // Check for InitData
      if (!tg.initData || tg.initData.length === 0) {
        console.warn('⚠️ No InitData available from Telegram');
        
        // Fallback to initDataUnsafe for development/testing
        if (tg.initDataUnsafe?.user) {
          const unsafeUser = tg.initDataUnsafe.user;
          const fallbackUser: TelegramUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url
          };
          
          setCurrentUserId(fallbackUser.id);
          updateState({
            user: fallbackUser,
            isAuthenticated: true,
            isLoading: false,
            error: 'Using unsafe auth - production apps should use InitData'
          });
          initializedRef.current = true;
          return;
        }
        
        throw new Error('No Telegram user data available');
      }

      // Authenticate with FastAPI using InitData
      console.log('🔐 Authenticating with FastAPI...');
      const authResult = await telegramAuthService.authenticateWithInitData(tg.initData);

      if (!authResult.success) {
        console.error('❌ FastAPI authentication failed:', authResult.error);
        toast.error('Authentication Failed', {
          description: authResult.details || authResult.error
        });
        
        throw new Error(authResult.error);
      }

      const authData = authResult as TelegramAuthResponse;
      console.log('✅ FastAPI authentication successful');
      
      // Show success message
      toast.success('Authentication Successful', {
        description: `Welcome back, ${authData.user.first_name}!`
      });

      setCurrentUserId(authData.user.id);
      updateState({
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      updateState({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false
      });
      
      toast.error('Authentication Error', {
        description: errorMessage
      });
    } finally {
      initializedRef.current = true;
    }
  };

  const signOut = () => {
    telegramAuthService.signOut();
    updateState({
      user: null,
      isAuthenticated: false,
      error: null
    });
    toast.success('Signed out successfully');
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          error: 'Authentication timeout - please refresh the app',
          isAuthenticated: false
        });
        initializedRef.current = true;
      }
    }, 10000); // 10 second timeout

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    ...state,
    signOut
  } as AuthState & { signOut: () => void };
}
