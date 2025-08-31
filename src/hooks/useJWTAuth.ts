
import { useState, useEffect, useRef } from 'react';
import { authService, AuthResponse } from '@/services/authService';
import { TelegramUser } from '@/types/telegram';

interface JWTAuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  isTelegramEnvironment: boolean;
}

export function useJWTAuth(): JWTAuthState {
  const [state, setState] = useState<JWTAuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    accessToken: null,
    isTelegramEnvironment: false,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<JWTAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const authenticateWithJWT = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting JWT authentication flow...');
    
    try {
      // Check Telegram environment
      const isTelegram = !!(window.Telegram?.WebApp);
      updateState({ isTelegramEnvironment: isTelegram });

      if (!isTelegram) {
        console.log('⚠️ Not in Telegram environment - using admin fallback');
        const adminUser: TelegramUser = {
          id: 2138564172,
          first_name: "Admin",
          last_name: "User",
          username: "admin",
          language_code: "en"
        };
        
        updateState({
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      }

      const tg = window.Telegram!.WebApp;
      
      // Initialize Telegram WebApp
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();

      console.log('📱 Telegram WebApp initialized');
      console.log('📊 InitData available:', !!tg.initData);
      console.log('📊 InitData length:', tg.initData?.length || 0);

      if (!tg.initData || tg.initData.length === 0) {
        throw new Error('No Telegram initData available');
      }

      // Step 1: Authenticate with FastAPI using initData
      console.log('🔐 Step 1: Authenticating with FastAPI...');
      const authResponse: AuthResponse = await authService.signInWithTelegram(tg.initData);
      
      console.log('✅ Step 1 Complete: JWT token received');
      console.log('🔑 User ID:', authResponse.user_id);

      // Step 2: Create user object from auth response
      const authenticatedUser: TelegramUser = {
        id: authResponse.user_id,
        first_name: authResponse.user_data?.first_name || 'User',
        last_name: authResponse.user_data?.last_name,
        username: authResponse.user_data?.username,
        language_code: authResponse.user_data?.language_code || 'en',
        is_premium: authResponse.user_data?.is_premium,
        photo_url: authResponse.user_data?.photo_url,
      };

      console.log('✅ Step 2 Complete: User object created');
      console.log('👤 Authenticated user:', authenticatedUser.first_name);

      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        accessToken: authResponse.access_token,
        isLoading: false,
        error: null
      });

      console.log('✅ JWT Authentication flow completed successfully');

    } catch (error) {
      console.error('❌ JWT Authentication failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      updateState({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ JWT Authentication timeout');
        updateState({
          isLoading: false,
          error: 'Authentication timeout',
          isAuthenticated: false
        });
        initializedRef.current = true;
      }
    }, 10000); // 10 second timeout

    authenticateWithJWT();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
