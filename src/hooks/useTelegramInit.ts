
import React, { useState, useEffect } from 'react';
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
    console.log('🔄 Enhanced Telegram auth initialization with aggressive real data extraction...');
    
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
        console.log('🔄 AGGRESSIVE Telegram data extraction starting...');
        
        const tg = window.Telegram.WebApp;
        
        // Enhanced WebApp initialization
        try {
          if (typeof tg.ready === 'function') {
            tg.ready();
            console.log('✅ Telegram WebApp ready');
          }
          
          if (typeof tg.expand === 'function') {
            tg.expand();
            console.log('✅ Telegram WebApp expanded');
          }

          // Apply theme safely
          if (tg.themeParams?.bg_color) {
            document.body.style.backgroundColor = tg.themeParams.bg_color;
          } else {
            document.body.style.backgroundColor = '#1f2937';
          }
          
          if (tg.viewportHeight) {
            document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
          }
          
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed, using defaults...', themeError);
          document.body.style.backgroundColor = '#1f2937';
        }
        
        // AGGRESSIVE user data extraction with comprehensive logging
        const unsafeData = tg.initDataUnsafe;
        const rawInitData = tg.initData;
        
        console.log('🔍 COMPREHENSIVE Telegram data analysis:');
        console.log('- WebApp version:', tg.version || 'unknown');
        console.log('- Platform:', tg.platform || 'unknown');
        console.log('- Full initDataUnsafe object:', JSON.stringify(unsafeData, null, 2));
        console.log('- Raw initData string:', rawInitData);
        console.log('- initDataUnsafe.user:', unsafeData?.user);
        console.log('- User ID from unsafe data:', unsafeData?.user?.id);
        console.log('- User object keys:', unsafeData?.user ? Object.keys(unsafeData.user) : 'no user');
        
        // Check for additional Telegram data sources
        console.log('🔍 Additional Telegram data sources:');
        console.log('- tg.WebAppUser:', (tg as any).WebAppUser);
        console.log('- tg.WebAppInitData:', (tg as any).WebAppInitData);
        console.log('- window.TelegramWebviewProxy:', (window as any).TelegramWebviewProxy);
        
        // Priority 1: Use unsafe data (most reliable)
        if (unsafeData?.user && unsafeData.user.id) {
          console.log('✅ SUCCESS: Using Telegram unsafe data with REAL user ID:', unsafeData.user.id);
          console.log('✅ Real user data:', JSON.stringify(unsafeData.user, null, 2));
          setUser(unsafeData.user);
          setCurrentUserId(unsafeData.user.id);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Priority 2: Parse initData with enhanced validation
        if (rawInitData && rawInitData.length > 0) {
          console.log('🔍 Attempting to parse raw initData:', rawInitData.substring(0, 100) + '...');
          try {
            const parsedInitData = parseTelegramInitData(rawInitData);
            console.log('🔍 Parsed initData result:', JSON.stringify(parsedInitData, null, 2));
            if (parsedInitData?.user && parsedInitData.user.id) {
              console.log('✅ SUCCESS: Using parsed Telegram initData with REAL user ID:', parsedInitData.user.id);
              setInitData(parsedInitData);
              setUser(parsedInitData.user);
              setCurrentUserId(parsedInitData.user.id);
              setError(null);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('❌ Failed to parse initData:', parseError);
          }
        }

        // Priority 3: Check for alternative data sources
        console.log('🔍 Checking alternative Telegram data sources...');
        
        // Check if there's user data in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        if (userParam) {
          try {
            const urlUser = JSON.parse(decodeURIComponent(userParam));
            console.log('🔍 Found user data in URL params:', urlUser);
            if (urlUser && urlUser.id) {
              console.log('✅ SUCCESS: Using URL param user data with ID:', urlUser.id);
              setUser(urlUser);
              setCurrentUserId(urlUser.id);
              setError(null);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse URL user param:', e);
          }
        }

        // Priority 4: Check hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashUser = hashParams.get('user');
        if (hashUser) {
          try {
            const user = JSON.parse(decodeURIComponent(hashUser));
            if (user && user.id) {
              console.log('✅ SUCCESS: Using hash param user data with ID:', user.id);
              setUser(user);
              setCurrentUserId(user.id);
              setError(null);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse hash user param:', e);
          }
        }

        // Priority 5: Enhanced fallback - ONLY if we couldn't find real data
        console.log('❌ FAILED to extract real user data from Telegram!');
        console.log('⚠️ All Telegram data sources exhausted, this should NOT happen in production');
        
        // In Telegram but no user data - show error instead of mock user
        setError("Could not extract user data from Telegram. Please restart the app or contact support.");
        setIsLoading(false);
        return;
      }

      // Not in Telegram - development mode
      console.log('🔧 Development mode - not in Telegram environment');
      const mockUser = createMockUser();
      setUser(mockUser);
      setCurrentUserId(mockUser.id);
      setError(null);
      setIsLoading(false);
      setIsTelegramEnvironment(false);

    } catch (err) {
      console.error('❌ Critical error during initialization:', err);
      setError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const refreshAuth = () => {
    console.log('🔄 Refreshing enhanced authentication...');
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      initializeAuth();
    }, 150);
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    if (mounted) {
      initializeAuth();
      
      // Fallback timeout - but don't force completion with mock data
      initTimeout = setTimeout(() => {
        if (mounted && isLoading) {
          console.log('⏰ Initialization timeout reached');
          if (isTelegramEnvironment) {
            setError("Timeout extracting user data from Telegram. Please refresh or restart the app.");
          } else {
            // Only use mock in non-Telegram environment
            const timeoutUser = createMockUser();
            setUser(timeoutUser);
            setCurrentUserId(timeoutUser.id);
            setError(null);
          }
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout
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
    error,
    isTelegramEnvironment,
    refreshAuth,
    retryAuth: refreshAuth,
  };
}
