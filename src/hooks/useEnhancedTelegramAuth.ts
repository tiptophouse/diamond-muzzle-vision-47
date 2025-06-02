import { useState, useEffect, useRef, useCallback } from 'react';
import { TelegramUser } from '@/types/telegram';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';

interface SessionData {
  user: TelegramUser;
  timestamp: number;
  isTelegramEnvironment: boolean;
}

const SESSION_STORAGE_KEY = 'diamond_muzzle_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function useEnhancedTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const maxRetries = 3;

  // Save session to localStorage
  const saveSession = useCallback((userData: TelegramUser, telegramEnv: boolean) => {
    try {
      const sessionData: SessionData = {
        user: userData,
        timestamp: Date.now(),
        isTelegramEnvironment: telegramEnv
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      console.log('💾 Session saved to localStorage');
    } catch (error) {
      console.warn('⚠️ Failed to save session:', error);
    }
  }, []);

  // Load session from localStorage
  const loadSession = useCallback((): SessionData | null => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      
      const sessionData: SessionData = JSON.parse(stored);
      const isExpired = Date.now() - sessionData.timestamp > SESSION_EXPIRY;
      
      if (isExpired) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        console.log('🗑️ Expired session removed');
        return null;
      }
      
      console.log('✅ Valid session loaded from localStorage');
      return sessionData;
    } catch (error) {
      console.warn('⚠️ Failed to load session:', error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }, []);

  const createMockUser = (): TelegramUser => {
    return {
      id: 2138564172,
      first_name: "Admin",
      last_name: "User", 
      username: "adminuser",
      language_code: "en"
    };
  };

  const safeSetState = useCallback((userData: TelegramUser, telegramEnv: boolean, shouldSave: boolean = true) => {
    if (!mountedRef.current || initializedRef.current) return;
    
    console.log('✅ Setting enhanced auth state with user:', userData.first_name);
    
    setUser(userData);
    setIsTelegramEnvironment(telegramEnv);
    setError(null);
    setIsLoading(false);
    initializedRef.current = true;
    
    if (shouldSave) {
      saveSession(userData, telegramEnv);
    }
  }, [saveSession]);

  const initializeAuth = useCallback(async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log(`🔄 Starting enhanced auth initialization (attempt ${retryCount + 1}/${maxRetries})`);
    
    try {
      // Try to load from localStorage first
      const savedSession = loadSession();
      if (savedSession) {
        console.log('🔄 Using saved session');
        safeSetState(savedSession.user, savedSession.isTelegramEnvironment, false);
        return;
      }

      // Server-side check
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering - using fallback');
        const mockUser = createMockUser();
        safeSetState(mockUser, false);
        return;
      }

      // Clean URL parameters that might interfere
      const url = new URL(window.location.href);
      const hasConflictingParams = url.searchParams.has('tgWebAppData') || 
                                   url.hash.includes('tgWebAppData');
      
      if (hasConflictingParams) {
        console.log('🧹 Cleaning conflicting URL parameters');
        // Keep only hash routing, remove Telegram params from main URL
        const cleanHash = url.hash.split('&')[0].split('?')[0];
        window.history.replaceState({}, '', `${url.origin}${url.pathname}${cleanHash}`);
      }

      // Enhanced Telegram detection
      const inTelegram = isTelegramWebApp();
      console.log('📱 Enhanced Telegram environment detected:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Safe WebApp initialization with error recovery
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          
          // Apply theme safely
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          }
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, continuing...', themeError);
        }
        
        // Try to get real user data with multiple strategies
        let realUser: TelegramUser | null = null;
        
        // Strategy 1: initDataUnsafe
        if (tg.initDataUnsafe?.user?.id) {
          const user = tg.initDataUnsafe.user;
          if (user.first_name && !['Test', 'Telegram', 'Mock'].includes(user.first_name)) {
            console.log('✅ Found REAL user data from initDataUnsafe');
            realUser = user;
          }
        }
        
        // Strategy 2: Parse initData
        if (!realUser && tg.initData && tg.initData.length > 10) {
          try {
            const parsedInitData = parseTelegramInitData(tg.initData);
            if (parsedInitData?.user?.id) {
              const user = parsedInitData.user;
              if (user.first_name && !['Test', 'Telegram', 'Mock'].includes(user.first_name)) {
                console.log('✅ Found REAL user data from parsed initData');
                realUser = user;
              }
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse initData:', parseError);
          }
        }
        
        if (realUser) {
          safeSetState(realUser, true);
          return;
        }
        
        // Fallback for Telegram environment
        console.log('⚠️ In Telegram but no real user data - creating Telegram fallback');
        const telegramFallback = {
          id: 1000000000 + Math.floor(Math.random() * 1000000),
          first_name: "Telegram",
          last_name: "User",
          username: "telegram_user_" + Math.floor(Math.random() * 1000),
          language_code: "en"
        };
        safeSetState(telegramFallback, true);
        return;
      }

      // Development mode fallback - always admin
      console.log('🔧 Development mode - using admin user');
      const adminUser = createMockUser();
      safeSetState(adminUser, false);

    } catch (err) {
      console.error('❌ Enhanced auth initialization error:', err);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying auth initialization (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          initializedRef.current = false;
          initializeAuth();
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Final fallback after all retries
      console.log('🚨 Using emergency fallback after all retries failed');
      const emergencyUser = createMockUser();
      setError('Auth failed, using emergency mode');
      safeSetState(emergencyUser, false);
    }
  }, [loadSession, safeSetState, retryCount]);

  // Manual retry function for user-triggered retries
  const retryAuth = useCallback(() => {
    console.log('🔄 Manual auth retry requested');
    initializedRef.current = false;
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    
    // Clear stored session to force fresh auth
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    setTimeout(initializeAuth, 100);
  }, [initializeAuth]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Extended timeout for better reliability
    const timeoutId = setTimeout(() => {
      if (isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Enhanced auth initialization timeout - using emergency fallback');
        const emergencyUser = createMockUser();
        setError('Auth timeout - using emergency mode');
        safeSetState(emergencyUser, false);
      }
    }, 10000); // Increased to 10 seconds

    // Initialize immediately
    initializeAuth();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [initializeAuth]);

  return {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated: !!user,
    retryAuth,
    retryCount,
  };
}
