
import { useState, useEffect, useCallback } from 'react';
import { createJWTFromTelegramData, validateTelegramHash, type TelegramJWTPayload } from '@/utils/jwt';

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
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, any>;
  isExpanded: boolean;
  viewportHeight: number;
  headerColor: string;
  backgroundColor: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

interface StrictTelegramAuthState {
  isAuthenticated: boolean;
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  webApp: TelegramWebApp | null;
  jwt: string | null;
  authScore: number; // 0-100, confidence in authentication
}

// Bot token for validation (should be environment variable in production)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Enhanced Telegram environment detection
function isGenuineTelegram(): boolean {
  try {
    // Check if we're in Telegram WebApp environment
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return false;

    // Check for Telegram-specific properties
    const hasInitData = typeof tg.initData === 'string' && tg.initData.length > 0;
    const hasVersion = typeof tg.version === 'string';
    const hasPlatform = typeof tg.platform === 'string';
    const hasThemeParams = typeof tg.themeParams === 'object';

    // Check user agent for Telegram indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTelegramUA = userAgent.includes('telegram') || 
                         userAgent.includes('tgwebapp') ||
                         userAgent.includes('tdesktop');

    // Check for Telegram-specific global objects
    const hasTelegramGlobals = 'TelegramWebviewProxy' in window || 
                              'TelegramGameProxy' in window ||
                              'external' in window;

    // Score the authentication
    let score = 0;
    if (hasInitData) score += 40;
    if (hasVersion && hasPlatform) score += 20;
    if (hasThemeParams) score += 15;
    if (hasTelegramUA) score += 15;
    if (hasTelegramGlobals) score += 10;

    console.log('🔐 Telegram environment score:', score, {
      hasInitData,
      hasVersion,
      hasPlatform,
      hasThemeParams,
      hasTelegramUA,
      hasTelegramGlobals
    });

    return score >= 60; // Require at least 60% confidence
  } catch (error) {
    console.error('🔐 Error checking Telegram environment:', error);
    return false;
  }
}

// Validate user data integrity
function validateUserData(user: TelegramUser): boolean {
  if (!user || typeof user.id !== 'number' || user.id <= 0) return false;
  if (!user.first_name || typeof user.first_name !== 'string') return false;
  
  // Optional fields validation
  if (user.last_name && typeof user.last_name !== 'string') return false;
  if (user.username && typeof user.username !== 'string') return false;
  if (user.language_code && typeof user.language_code !== 'string') return false;
  if (user.is_premium !== undefined && typeof user.is_premium !== 'boolean') return false;
  if (user.photo_url && typeof user.photo_url !== 'string') return false;

  return true;
}

// Calculate authentication confidence score
function calculateAuthScore(webApp: TelegramWebApp, user: TelegramUser | null): number {
  let score = 0;

  // Basic Telegram WebApp presence
  if (webApp) score += 20;

  // InitData validation
  if (webApp?.initData && webApp.initData.length > 50) score += 30;

  // User data quality
  if (user && validateUserData(user)) {
    score += 25;
    
    // Additional user data points
    if (user.username) score += 5;
    if (user.language_code) score += 5;
    if (user.is_premium !== undefined) score += 5;
    if (user.photo_url) score += 5;
  }

  // Environment checks
  if (isGenuineTelegram()) score += 20;

  // Hash validation (if bot token is available)
  if (BOT_TOKEN && webApp?.initData) {
    try {
      if (validateTelegramHash(webApp.initData, BOT_TOKEN)) {
        score += 20;
      }
    } catch (error) {
      console.warn('🔐 Hash validation failed:', error);
    }
  }

  return Math.min(score, 100);
}

export function useStrictTelegramAuth(): StrictTelegramAuthState {
  const [state, setState] = useState<StrictTelegramAuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
    webApp: null,
    jwt: null,
    authScore: 0
  });

  const authenticate = useCallback(async () => {
    try {
      console.log('🔐 Starting strict Telegram authentication...');
      
      // Check if Telegram WebApp is available
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        throw new Error('Telegram WebApp not available. This app must be opened in Telegram.');
      }

      // Wait for WebApp to be ready
      tg.ready();
      
      const webApp: TelegramWebApp = {
        initData: tg.initData || '',
        initDataUnsafe: tg.initDataUnsafe || {},
        version: tg.version || '',
        platform: tg.platform || '',
        colorScheme: tg.colorScheme || 'light',
        themeParams: tg.themeParams || {},
        isExpanded: tg.isExpanded || false,
        viewportHeight: tg.viewportHeight || 0,
        headerColor: tg.headerColor || '#1f2937',
        backgroundColor: tg.backgroundColor || '#ffffff',
        ready: () => tg.ready(),
        expand: () => tg.expand(),
        close: () => tg.close()
      };

      console.log('🔐 WebApp data:', {
        hasInitData: !!webApp.initData,
        initDataLength: webApp.initData.length,
        hasUser: !!webApp.initDataUnsafe.user,
        version: webApp.version,
        platform: webApp.platform
      });

      // Validate environment
      if (!isGenuineTelegram()) {
        throw new Error('Invalid Telegram environment detected');
      }

      // Extract user data
      const user = webApp.initDataUnsafe.user;
      if (!user || !validateUserData(user)) {
        throw new Error('Invalid or missing user data from Telegram');
      }

      // Ensure photo_url is properly typed
      const validatedUser: TelegramUser = {
        ...user,
        photo_url: typeof user.photo_url === 'string' ? user.photo_url : undefined
      };

      // Calculate authentication score
      const authScore = calculateAuthScore(webApp, validatedUser);
      console.log('🔐 Authentication score:', authScore);

      if (authScore < 70) {
        throw new Error(`Authentication confidence too low: ${authScore}%. This app requires secure Telegram authentication.`);
      }

      // Create JWT token
      let jwt: string | null = null;
      if (BOT_TOKEN && webApp.initData) {
        try {
          jwt = createJWTFromTelegramData(webApp.initData, BOT_TOKEN);
          console.log('🔐 JWT token created successfully');
        } catch (error) {
          console.warn('🔐 JWT creation failed:', error);
        }
      }

      setState({
        isAuthenticated: true,
        user: validatedUser,
        isLoading: false,
        error: null,
        webApp,
        jwt,
        authScore
      });

      console.log('✅ Strict Telegram authentication successful');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('❌ Strict Telegram authentication failed:', errorMessage);
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: errorMessage,
        webApp: null,
        jwt: null,
        authScore: 0
      });
    }
  }, []);

  // Re-authenticate on token refresh
  const refreshAuth = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    authenticate();
  }, [authenticate]);

  useEffect(() => {
    // Initialize authentication
    authenticate();

    // Set up periodic validation (every 5 minutes)
    const interval = setInterval(() => {
      if (state.isAuthenticated && state.authScore < 70) {
        console.log('🔐 Re-validating authentication due to low score');
        refreshAuth();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authenticate, refreshAuth, state.isAuthenticated, state.authScore]);

  return state;
}
