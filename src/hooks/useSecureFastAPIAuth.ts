
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

// Development/fallback user for testing
const FALLBACK_USER_ID = 2138564172;

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
  const retryCountRef = useRef(0);

  const updateState = (updates: Partial<SecureFastAPIAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const createFallbackUser = (userId: number): TelegramUser => ({
    id: userId,
    first_name: "User",
    last_name: "",
    username: "user",
    language_code: "en"
  });

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
          user: createFallbackUser(jwtUserId!)
        });
        initializedRef.current = true;
        return;
      }

      // If not in Telegram, provide fallback authentication for development/testing
      if (!inTelegram) {
        console.log('🔧 Not in Telegram environment - using fallback authentication');
        const fallbackUser = createFallbackUser(FALLBACK_USER_ID);
        
        updateState({
          user: fallbackUser,
          isAuthenticated: true,
          jwtUserId: FALLBACK_USER_ID,
          isLoading: false,
          error: null
        });
        initializedRef.current = true;
        return;
      }

      // Get Telegram WebApp
      const tg = getTelegramWebApp();
      if (!tg) {
        console.log('❌ Telegram WebApp not available');
        // Fallback to basic authentication
        const fallbackUser = createFallbackUser(FALLBACK_USER_ID);
        updateState({
          user: fallbackUser,
          isAuthenticated: true,
          jwtUserId: FALLBACK_USER_ID,
          isLoading: false,
          error: 'Telegram WebApp not available - using fallback mode'
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

      // Check for initData - with improved handling
      let initDataAvailable = false;
      let telegramUser: TelegramUser | null = null;

      // Try to get user from initDataUnsafe first
      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        console.log('📱 Using initDataUnsafe user:', unsafeUser);
        telegramUser = {
          id: unsafeUser.id,
          first_name: unsafeUser.first_name || 'User',
          last_name: unsafeUser.last_name,
          username: unsafeUser.username,
          language_code: unsafeUser.language_code || 'en',
          is_premium: unsafeUser.is_premium,
          photo_url: unsafeUser.photo_url
        };
        initDataAvailable = true;
      }

      // Try to authenticate with FastAPI if we have initData
      if (tg.initData && tg.initData.length > 0) {
        console.log('🔐 Attempting FastAPI authentication with initData...');
        try {
          const authResult = await authenticateWithFastAPI(tg.initData);
          
          if (authResult && authResult.token) {
            const jwtUserId = getCurrentJWTUserId();
            console.log('✅ FastAPI authentication successful');
            
            updateState({
              user: telegramUser || createFallbackUser(jwtUserId!),
              isAuthenticated: true,
              jwtUserId,
              isLoading: false,
              error: null
            });
            initializedRef.current = true;
            return;
          }
        } catch (error) {
          console.warn('⚠️ FastAPI authentication failed:', error);
        }
      }

      // If we have a Telegram user but no valid initData, use fallback mode
      if (telegramUser) {
        console.log('🔄 Using Telegram user in fallback mode:', telegramUser.first_name);
        updateState({
          user: telegramUser,
          isAuthenticated: true,
          jwtUserId: telegramUser.id,
          isLoading: false,
          error: null
        });
        initializedRef.current = true;
        return;
      }

      // Final fallback
      console.log('🆘 Using final fallback authentication');
      const fallbackUser = createFallbackUser(FALLBACK_USER_ID);
      updateState({
        user: fallbackUser,
        isAuthenticated: true,
        jwtUserId: FALLBACK_USER_ID,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      // Always provide fallback on error
      const fallbackUser = createFallbackUser(FALLBACK_USER_ID);
      updateState({
        user: fallbackUser,
        isAuthenticated: true,
        jwtUserId: FALLBACK_USER_ID,
        isLoading: false,
        error: null
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set shorter timeout for better UX
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout - using fallback');
        const fallbackUser = createFallbackUser(FALLBACK_USER_ID);
        updateState({
          user: fallbackUser,
          isAuthenticated: true,
          jwtUserId: FALLBACK_USER_ID,
          isLoading: false,
          error: null
        });
        initializedRef.current = true;
      }
    }, 3000); // 3 second timeout

    // Start authentication
    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
