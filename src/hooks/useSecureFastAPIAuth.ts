
import { useState, useEffect, useRef } from 'react';
import { authenticateWithFastAPI, isJWTValid, getCurrentJWTUserId, clearJWTToken } from '@/lib/api/jwtAuth';
import { isTelegramWebAppEnvironment, getTelegramWebApp } from '@/utils/telegramWebApp';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface SecureFastAPIAuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  jwtUserId: number | null;
}

export function useSecureFastAPIAuth(): SecureFastAPIAuthState {
  const [state, setState] = useState<SecureFastAPIAuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    jwtUserId: null,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<SecureFastAPIAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting secure FastAPI authentication...');
    
    try {
      // Check Telegram environment
      const inTelegram = isTelegramWebAppEnvironment();
      console.log('📱 Telegram environment detected:', inTelegram);
      
      updateState({ 
        isTelegramEnvironment: inTelegram,
        isLoading: true,
        error: null 
      });

      // Check if we already have a valid JWT
      if (isJWTValid()) {
        const jwtUserId = getCurrentJWTUserId();
        console.log('✅ Valid JWT found for user:', jwtUserId);
        
        updateState({
          isAuthenticated: true,
          jwtUserId,
          isLoading: false,
          user: {
            id: jwtUserId!,
            first_name: "Authenticated User",
            language_code: "en"
          }
        });
        initializedRef.current = true;
        return;
      }

      if (!inTelegram) {
        console.log('❌ Not in Telegram environment - authentication required');
        updateState({
          error: 'This app must be opened in Telegram',
          isLoading: false
        });
        initializedRef.current = true;
        return;
      }

      // Get Telegram WebApp
      const tg = getTelegramWebApp();
      if (!tg) {
        console.log('❌ Telegram WebApp not available');
        updateState({
          error: 'Telegram WebApp not available',
          isLoading: false
        });
        initializedRef.current = true;
        return;
      }

      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
      } catch (error) {
        console.warn('⚠️ Telegram WebApp setup warning:', error);
      }

      // Get initData for FastAPI authentication
      if (!tg.initData || tg.initData.length === 0) {
        console.log('❌ No Telegram initData available');
        updateState({
          error: 'No Telegram authentication data available',
          isLoading: false
        });
        initializedRef.current = true;
        return;
      }

      console.log('🔐 Authenticating with FastAPI using Telegram initData...');
      
      // Authenticate with FastAPI
      const authResult = await authenticateWithFastAPI(tg.initData);
      
      if (!authResult || !authResult.token) {
        console.log('❌ FastAPI authentication failed');
        updateState({
          error: 'Authentication with server failed',
          isLoading: false
        });
        initializedRef.current = true;
        return;
      }

      // Extract user info from Telegram
      let telegramUser: TelegramUser | null = null;
      
      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        telegramUser = {
          id: unsafeUser.id,
          first_name: unsafeUser.first_name || 'User',
          last_name: unsafeUser.last_name,
          username: unsafeUser.username,
          language_code: unsafeUser.language_code || 'en',
          is_premium: unsafeUser.is_premium,
          photo_url: unsafeUser.photo_url
        };
      }

      const jwtUserId = getCurrentJWTUserId();
      
      // Verify user_id consistency between Telegram and JWT
      if (telegramUser && jwtUserId && telegramUser.id !== jwtUserId) {
        console.warn('⚠️ User ID mismatch between Telegram and JWT:', telegramUser.id, 'vs', jwtUserId);
      }

      console.log('✅ Secure FastAPI authentication successful');
      console.log('📊 JWT User ID:', jwtUserId);
      console.log('📱 Telegram User:', telegramUser?.first_name);

      updateState({
        user: telegramUser || {
          id: jwtUserId!,
          first_name: "Authenticated User",
          language_code: "en"
        },
        isAuthenticated: true,
        jwtUserId,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Secure authentication error:', error);
      clearJWTToken();
      
      updateState({
        error: 'Authentication failed',
        isLoading: false,
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
        console.warn('⚠️ Authentication timeout');
        updateState({
          error: 'Authentication timeout',
          isLoading: false
        });
        initializedRef.current = true;
      }
    }, 10000); // 10 second timeout

    // Start authentication
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
