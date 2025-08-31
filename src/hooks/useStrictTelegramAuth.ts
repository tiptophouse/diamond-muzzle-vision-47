
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { signInToBackend } from '@/lib/api/auth';
import { generateMockInitData } from '@/utils/initDataDebugger';

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  accessDeniedReason: string | null;
}

export function useStrictTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    accessDeniedReason: null,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting STRICT Telegram-only authentication...');
    
    try {
      // Check for Telegram WebApp environment
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.error('❌ Not in Telegram WebApp environment - checking if development');
        
        // Development mode fallback
        if (window.location.hostname === 'localhost' || 
            window.location.hostname.includes('lovableproject.com')) {
          console.log('🔧 Development environment detected - using mock authentication');
          
          const mockUser: TelegramUser = {
            id: 2138564172,
            first_name: "Dev",
            last_name: "User",
            username: "devuser",
            language_code: "en"
          };
          
          updateState({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            isTelegramEnvironment: false,
            error: null,
            accessDeniedReason: null
          });
          return;
        }
        
        updateState({
          isLoading: false,
          isTelegramEnvironment: false,
          accessDeniedReason: 'not_telegram_environment',
          error: 'This app only works inside Telegram'
        });
        return;
      }

      const tg = window.Telegram.WebApp;
      updateState({ isTelegramEnvironment: true });

      // 🐛 DEBUG: Log complete Telegram WebApp environment
      console.log('🔍 TELEGRAM WEBAPP DEBUG INFO:', {
        telegram_available: !!window.Telegram,
        webApp_available: !!window.Telegram.WebApp,
        version: tg.version || 'unknown',
        platform: tg.platform || 'unknown',
        colorScheme: tg.colorScheme || 'unknown',
        isExpanded: tg.isExpanded || false,
        viewportHeight: tg.viewportHeight || 0,
        headerColor: tg.headerColor || 'unknown',
        backgroundColor: tg.backgroundColor || 'unknown'
      });

      // 🐛 DEBUG: Log detailed initData information
      console.log('🔍 INIT DATA DETAILED DEBUG:');
      console.log('📋 Raw initData:', {
        value: tg.initData,
        type: typeof tg.initData,
        length: tg.initData?.length || 0,
        isEmpty: !tg.initData || tg.initData.length === 0,
        firstChars: tg.initData?.substring(0, 50) || 'EMPTY'
      });

      // 🐛 DEBUG: Log initDataUnsafe details
      console.log('📋 InitDataUnsafe:', {
        value: tg.initDataUnsafe,
        type: typeof tg.initDataUnsafe,
        keys: Object.keys(tg.initDataUnsafe || {}),
        hasUser: !!(tg.initDataUnsafe?.user),
        user: tg.initDataUnsafe?.user || null
      });

      // Initialize Telegram WebApp
      try {
        if (typeof tg.ready === 'function') tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        console.log('✅ Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ Telegram WebApp initialization warning:', error);
      }

      // Check for initData - REQUIRED
      if (!tg.initData || tg.initData.length === 0) {
        console.error('❌ No Telegram initData found');
        console.log('🐛 EMPTY INIT DATA DEBUG:', {
          initDataExists: !!tg.initData,
          initDataType: typeof tg.initData,
          initDataValue: tg.initData,
          initDataUnsafeExists: !!tg.initDataUnsafe,
          initDataUnsafeKeys: Object.keys(tg.initDataUnsafe || {}),
          windowTelegramKeys: Object.keys(window.Telegram || {}),
          webAppKeys: Object.keys(tg || {})
        });

        // For development/testing, use mock initData
        if (window.location.hostname === 'localhost' || 
            window.location.hostname.includes('lovableproject.com')) {
          console.log('🔧 Using mock initData for development testing');
          const mockInitData = generateMockInitData(2138564172, "Dev User");
          
          try {
            const jwtToken = await signInToBackend(mockInitData);
            if (jwtToken) {
              const mockUser: TelegramUser = {
                id: 2138564172,
                first_name: "Dev",
                last_name: "User",
                username: "devuser",
                language_code: "en"
              };
              
              updateState({
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                accessDeniedReason: null
              });
              return;
            }
          } catch (error) {
            console.warn('⚠️ Mock authentication failed:', error);
          }
        }

        updateState({
          isLoading: false,
          accessDeniedReason: 'no_init_data',
          error: 'No Telegram authentication data found'
        });
        return;
      }

      console.log('🔍 Found Telegram initData, length:', tg.initData.length);
      console.log('🐛 INIT DATA CONTENT DEBUG:', {
        rawInitData: tg.initData,
        parsedAsUrl: new URLSearchParams(tg.initData),
        urlParamsEntries: [...new URLSearchParams(tg.initData).entries()]
      });

      // Step 1: Sign in to FastAPI backend using initData
      console.log('🔐 Signing in to FastAPI backend...');
      console.log('🐛 BACKEND REQUEST DEBUG - Sending initData:', {
        initDataLength: tg.initData.length,
        initDataPreview: tg.initData.substring(0, 100) + '...',
        requestBody: { init_data: tg.initData }
      });

      const jwtToken = await signInToBackend(tg.initData);
      
      if (!jwtToken) {
        console.error('❌ Backend sign-in failed - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'backend_auth_failed',
          error: 'Failed to authenticate with backend'
        });
        return;
      }

      console.log('✅ JWT token received from backend');

      // Step 2: Extract user data from initDataUnsafe (if available)
      let authenticatedUser: TelegramUser | null = null;

      if (tg.initDataUnsafe?.user) {
        const unsafeUser = tg.initDataUnsafe.user;
        console.log('🐛 USER DATA FROM UNSAFE DEBUG:', unsafeUser);
        
        if (unsafeUser.id && unsafeUser.first_name) {
          authenticatedUser = {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
            language_code: unsafeUser.language_code || 'en',
            is_premium: unsafeUser.is_premium,
            photo_url: unsafeUser.photo_url,
            phone_number: (unsafeUser as any).phone_number
          };
          console.log('✅ User data extracted from initDataUnsafe');
        }
      }

      // If no user data from initDataUnsafe, try parsing initData
      if (!authenticatedUser && tg.initData) {
        try {
          const urlParams = new URLSearchParams(tg.initData);
          const userParam = urlParams.get('user');
          
          console.log('🐛 PARSING INIT DATA FOR USER:', {
            hasUserParam: !!userParam,
            userParamValue: userParam
          });
          
          if (userParam) {
            const user = JSON.parse(decodeURIComponent(userParam));
            console.log('🐛 PARSED USER FROM INIT DATA:', user);
            
            if (user.id && user.first_name) {
              authenticatedUser = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                language_code: user.language_code || 'en',
                is_premium: user.is_premium,
                photo_url: user.photo_url,
                phone_number: user.phone_number
              };
              console.log('✅ User data parsed from initData');
            }
          }
        } catch (error) {
          console.error('❌ Failed to parse user data from initData:', error);
        }
      }

      // If still no user data, authentication failed
      if (!authenticatedUser) {
        console.error('❌ No user data found in Telegram initData - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'no_user_data',
          error: 'No user data found in Telegram authentication'
        });
        return;
      }

      // Success - user authenticated via Telegram + JWT
      console.log('✅ Authentication successful for user:', authenticatedUser.first_name, 'ID:', authenticatedUser.id);
      updateState({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessDeniedReason: null
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        isLoading: false,
        accessDeniedReason: 'system_error',
        error: error instanceof Error ? error.message : 'Authentication system error'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for authentication (5 seconds)
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.error('❌ Authentication timeout - access denied');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please reload the app'
        });
        initializedRef.current = true;
      }
    }, 5000);

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
