
import { useState, useEffect, useRef } from 'react';
import { signInToBackend } from '@/lib/api/auth';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
}

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  jwtToken: string | null;
}

// Enhanced Telegram environment detection
function isGenuineTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const tg = (window as any).Telegram?.WebApp as TelegramWebApp | undefined;
  if (!tg) return false;
  
  // Multi-layer validation
  const hasInitData = tg.initData && tg.initData.length > 0;
  const hasValidVersion = tg.version && tg.version.length > 0;
  const hasValidPlatform = tg.platform && ['android', 'ios', 'macos', 'tdesktop', 'web'].includes(tg.platform);
  const hasTelegramUserAgent = navigator.userAgent.includes('Telegram') || 
                               navigator.userAgent.includes('TelegramBot') ||
                               window.location.href.includes('tgWebAppPlatform');
  
  // Check for Telegram-specific window properties
  const hasTelegramProperties = !!(window as any).TelegramGameProxy || 
                                !!(window as any).TelegramWebviewProxy ||
                                document.documentElement.classList.contains('tg-viewport');
  
  console.log('🔍 Telegram Environment Validation:', {
    hasWebApp: !!tg,
    hasInitData,
    initDataLength: tg.initData?.length || 0,
    hasValidVersion,
    version: tg.version,
    hasValidPlatform,
    platform: tg.platform,
    hasTelegramUserAgent,
    userAgent: navigator.userAgent.substring(0, 100),
    hasTelegramProperties,
    url: window.location.href
  });
  
  // Require at least initData and one additional validation
  return hasInitData && (hasValidVersion || hasValidPlatform || hasTelegramUserAgent || hasTelegramProperties);
}

export function useSecureTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    jwtToken: null,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const logUserLogin = async (user: TelegramUser, token: string) => {
    try {
      console.log('📝 Logging authenticated user:', user.first_name, user.id);
      
      const loginData = {
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
        photo_url: user.photo_url,
        jwt_token_hash: btoa(token.substring(0, 50)), // Hash first 50 chars for security
        authentication_method: 'fastapi_jwt'
      };

      const { error } = await supabase.functions.invoke('log-user-login', {
        body: loginData
      });

      if (error) {
        console.error('❌ Failed to log user login:', error);
      } else {
        console.log('✅ User login logged successfully');
      }
    } catch (error) {
      console.error('❌ Error logging user login:', error);
    }
  };

  const authenticateWithFastAPI = async (initData: string): Promise<boolean> => {
    try {
      console.log('🔐 Authenticating with FastAPI using initData');
      console.log('📤 InitData length:', initData.length);
      
      const jwtToken = await signInToBackend(initData);
      
      if (!jwtToken) {
        console.error('❌ FastAPI authentication failed - no JWT token received');
        updateState({
          error: 'Authentication failed - unable to verify Telegram data',
          isLoading: false,
          isAuthenticated: false
        });
        return false;
      }

      console.log('✅ FastAPI authentication successful, JWT token received');
      
      // Parse user data from initData (since FastAPI validated it)
      try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        
        if (!userParam) {
          throw new Error('No user data in validated initData');
        }

        const telegramUser = JSON.parse(decodeURIComponent(userParam));
        
        const authenticatedUser: TelegramUser = {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          language_code: telegramUser.language_code || 'en',
          is_premium: telegramUser.is_premium,
          photo_url: telegramUser.photo_url
        };

        console.log('👤 Authenticated user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);

        updateState({
          user: authenticatedUser,
          jwtToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        // Log the successful authentication
        await logUserLogin(authenticatedUser, jwtToken);
        
        return true;
      } catch (parseError) {
        console.error('❌ Failed to parse user data from validated initData:', parseError);
        updateState({
          error: 'Authentication successful but failed to parse user data',
          isLoading: false,
          isAuthenticated: false
        });
        return false;
      }
    } catch (error) {
      console.error('❌ FastAPI authentication error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false,
        isAuthenticated: false
      });
      return false;
    }
  };

  const initializeAuth = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔄 Starting secure Telegram authentication...');
    
    try {
      // Enhanced Telegram environment detection
      const inTelegram = isGenuineTelegramWebApp();
      console.log('📱 Telegram environment detected:', inTelegram);
      
      updateState({ isTelegramEnvironment: inTelegram });

      if (!inTelegram) {
        console.log('❌ Not in Telegram environment - access denied');
        updateState({
          error: 'This application only works within Telegram',
          isLoading: false,
          isAuthenticated: false
        });
        initializedRef.current = true;
        return;
      }

      const tg = (window as any).Telegram.WebApp as TelegramWebApp;
      
      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ Telegram WebApp initialized');
      } catch (setupError) {
        console.warn('⚠️ Telegram WebApp setup failed:', setupError);
      }

      // Validate initData presence
      if (!tg.initData || tg.initData.length === 0) {
        console.error('❌ No initData available - cannot authenticate');
        updateState({
          error: 'No Telegram authentication data available',
          isLoading: false,
          isAuthenticated: false
        });
        initializedRef.current = true;
        return;
      }

      console.log('🔍 InitData found, authenticating with FastAPI...');
      
      // Authenticate with FastAPI using initData
      const authSuccess = await authenticateWithFastAPI(tg.initData);
      
      if (!authSuccess) {
        console.error('❌ FastAPI authentication failed');
        // Error state already set in authenticateWithFastAPI
      }

    } catch (error) {
      console.error('❌ Authentication initialization error:', error);
      updateState({
        error: 'Authentication initialization failed',
        isLoading: false,
        isAuthenticated: false
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for authentication process
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          error: 'Authentication timeout - please try refreshing',
          isLoading: false,
          isAuthenticated: false
        });
        initializedRef.current = true;
      }
    }, 10000); // 10 seconds timeout

    // Start authentication
    initializeAuth();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
