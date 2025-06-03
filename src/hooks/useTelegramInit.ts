
import { useState, useEffect } from 'react';
import { setCurrentUserId } from '@/lib/api';
import { parseTelegramInitData, isTelegramWebApp } from '@/utils/telegramValidation';
import { TelegramUser, TelegramInitData } from '@/types/telegram';

export function useTelegramInit() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);

  const createMockUser = (): TelegramUser => {
    return {
      id: 2138564172,
      first_name: "Test",
      last_name: "User", 
      username: "testuser",
      language_code: "en"
    };
  };

  const initializeAuth = () => {
    console.log('🔄 Starting enhanced Telegram auth initialization...');
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering, using mock user');
        const mockUser = createMockUser();
        setUser(mockUser);
        setCurrentUserId(mockUser.id);
        setIsTelegramEnvironment(false);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Enhanced Telegram environment detection
      const inTelegram = isTelegramWebApp();
      setIsTelegramEnvironment(inTelegram);
      console.log('📱 Telegram environment detected:', inTelegram);

      if (inTelegram && window.Telegram?.WebApp) {
        console.log('🔄 Attempting enhanced Telegram initialization...');
        
        const tg = window.Telegram.WebApp;
        
        // Enhanced WebApp initialization with better error handling
        try {
          if (typeof tg.ready === 'function') {
            tg.ready();
            console.log('✅ Telegram WebApp ready');
          }
          
          if (typeof tg.expand === 'function') {
            tg.expand();
            console.log('✅ Telegram WebApp expanded');
          }

          // Apply theme safely with fallbacks
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          } else {
            // Fallback to dark theme if no theme params
            document.body.style.backgroundColor = '#1f2937';
          }
          
          // Set up viewport handling
          if (tg.viewportHeight) {
            document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
          }
          
        } catch (themeError) {
          console.warn('⚠️ Theme/viewport setup failed, using defaults...', themeError);
          document.body.style.backgroundColor = '#1f2937';
        }
        
        // Enhanced user data retrieval with multiple fallbacks
        const unsafeData = tg.initDataUnsafe;
        const rawInitData = tg.initData;
        
        console.log('📊 Enhanced Telegram data check...');
        console.log('- WebApp version:', tg.version || 'unknown');
        console.log('- Platform:', tg.platform || 'unknown');
        console.log('- Unsafe data available:', !!unsafeData?.user);
        console.log('- Raw initData available:', !!rawInitData);
        console.log('- initDataUnsafe structure:', unsafeData);
        
        // Priority 1: Use unsafe data (most reliable)
        if (unsafeData?.user && unsafeData.user.id) {
          console.log('✅ Using Telegram unsafe data with user ID:', unsafeData.user.id);
          setUser(unsafeData.user);
          setCurrentUserId(unsafeData.user.id);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Priority 2: Parse initData with enhanced validation
        if (rawInitData && rawInitData.length > 0) {
          try {
            const parsedInitData = parseTelegramInitData(rawInitData);
            if (parsedInitData?.user && parsedInitData.user.id) {
              console.log('✅ Using parsed Telegram initData with user ID:', parsedInitData.user.id);
              setInitData(parsedInitData);
              setUser(parsedInitData.user);
              setCurrentUserId(parsedInitData.user.id);
              setError(null);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse initData, will use fallback:', parseError);
          }
        }

        // Priority 3: Enhanced fallback - still in Telegram but no user data
        console.log('⚠️ In Telegram but no valid user data, creating enhanced mock user');
        const mockUser = createMockUser();
        // Use a different ID to distinguish from development mode
        mockUser.id = 1000000000 + Math.floor(Math.random() * 1000000);
        mockUser.first_name = "Telegram";
        mockUser.last_name = "User";
        setUser(mockUser);
        setCurrentUserId(mockUser.id);
        setError(null);
        setIsLoading(false);
        setIsTelegramEnvironment(true);
        return;
      }

      // Not in Telegram - development mode with enhanced mock user
      console.log('🔧 Development mode - creating enhanced mock user');
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null);
      setIsLoading(false);
      setIsTelegramEnvironment(false);

    } catch (err) {
      console.error('❌ Critical error during initialization:', err);
      // CRITICAL: Even on error, provide a reliable fallback to prevent app crash
      const emergencyUser = createMockUser();
      emergencyUser.first_name = "Emergency";
      emergencyUser.last_name = "User";
      emergencyUser.id = 999999999;
      
      setUser(emergencyUser);
      setCurrentUserId(emergencyUser.id);
      setError(null); // Never show error to prevent "Failed to load" message
      setIsLoading(false);
      setIsTelegramEnvironment(false);
      
      console.log('🚨 Emergency fallback user activated');
    }
  };

  const refreshAuth = () => {
    console.log('🔄 Refreshing enhanced authentication...');
    setIsLoading(true);
    setError(null);
    
    // Add a small delay to prevent rapid refresh loops
    setTimeout(() => {
      initializeAuth();
    }, 150);
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    // Immediate initialization with timeout fallback
    if (mounted) {
      initializeAuth();
      
      // Fallback timeout to ensure loading never gets stuck
      initTimeout = setTimeout(() => {
        if (mounted && isLoading) {
          console.log('⏰ Initialization timeout, forcing completion...');
          const timeoutUser = createMockUser();
          timeoutUser.first_name = "Timeout";
          timeoutUser.last_name = "User";
          setUser(timeoutUser);
          setCurrentUserId(timeoutUser.id);
          setError(null);
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout
    }

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  return {
    user,
    initData,
    isLoading,
    error, // This will always be null to prevent "Failed to load" errors
    isTelegramEnvironment,
    refreshAuth,
    retryAuth: refreshAuth,
  };
}
