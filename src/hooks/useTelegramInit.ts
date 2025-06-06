
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

  const extractUserFromAllSources = (tg: any): TelegramUser | null => {
    console.log('🔍 COMPREHENSIVE Telegram data extraction starting...');
    
    // Log all available data sources
    console.log('📊 Available Telegram data sources:');
    console.log('- initDataUnsafe:', JSON.stringify(tg.initDataUnsafe, null, 2));
    console.log('- initData (raw):', tg.initData);
    console.log('- WebApp version:', tg.version);
    console.log('- Platform:', tg.platform);
    
    // Priority 1: initDataUnsafe (most reliable)
    if (tg.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      console.log('✅ Found user in initDataUnsafe:', user);
      if (user.id && typeof user.id === 'number') {
        console.log('🎯 SUCCESS: Real user ID from initDataUnsafe:', user.id);
        return user;
      }
    }

    // Priority 2: Parse raw initData
    if (tg.initData && tg.initData.length > 0) {
      console.log('🔍 Parsing raw initData string...');
      const parsed = parseTelegramInitData(tg.initData);
      if (parsed?.user?.id) {
        console.log('🎯 SUCCESS: Real user ID from parsed initData:', parsed.user.id);
        setInitData(parsed);
        return parsed.user;
      }
    }

    // Priority 3: Check URL parameters
    console.log('🔍 Checking URL parameters for user data...');
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) {
      try {
        const urlUser = JSON.parse(decodeURIComponent(userParam));
        if (urlUser?.id) {
          console.log('🎯 SUCCESS: Real user ID from URL params:', urlUser.id);
          return urlUser;
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
        if (user?.id) {
          console.log('🎯 SUCCESS: Real user ID from hash params:', user.id);
          return user;
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse hash user param:', e);
      }
    }

    // Priority 5: Check for alternative Telegram properties
    console.log('🔍 Checking alternative Telegram properties...');
    const altSources = [
      tg.WebAppUser,
      tg.WebAppInitData?.user,
      (window as any).TelegramWebviewProxy?.user,
      tg.user
    ];

    for (const source of altSources) {
      if (source?.id) {
        console.log('🎯 SUCCESS: Real user ID from alternative source:', source.id);
        return source;
      }
    }

    console.log('❌ No real user data found in any Telegram source');
    return null;
  };

  const initializeAuth = () => {
    console.log('🚀 ENHANCED Telegram auth initialization...');
    
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
          }
          
        } catch (themeError) {
          console.warn('⚠️ Theme setup failed:', themeError);
        }
        
        // ENHANCED USER EXTRACTION
        const realUser = extractUserFromAllSources(tg);
        
        if (realUser) {
          console.log('🎉 REAL USER DATA EXTRACTED SUCCESSFULLY!');
          console.log('👤 Real user:', JSON.stringify(realUser, null, 2));
          setUser(realUser);
          setCurrentUserId(realUser.id);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If we're in Telegram but no user data - this is unusual
        console.log('⚠️ In Telegram environment but no user data found');
        console.log('🔧 This might be a development/testing scenario');
        
        // For development, still use mock but flag it clearly
        const devUser = createMockUser();
        setUser(devUser);
        setCurrentUserId(devUser.id);
        setError("Development mode: Using test user data");
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
    console.log('🔄 Refreshing authentication...');
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
      
      // Timeout for initialization
      initTimeout = setTimeout(() => {
        if (mounted && isLoading) {
          console.log('⏰ Initialization timeout reached');
          if (!isTelegramEnvironment) {
            const timeoutUser = createMockUser();
            setUser(timeoutUser);
            setCurrentUserId(timeoutUser.id);
            setError(null);
          } else {
            setError("Timeout extracting user data from Telegram");
          }
          setIsLoading(false);
        }
      }, 8000);
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
