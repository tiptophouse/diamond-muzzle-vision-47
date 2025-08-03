
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { verifyTelegramUser, signInToBackend } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  accessDeniedReason: string | null;
  needsLogin: boolean;
}

// Admin credentials for development access
const ADMIN_USERNAME = 'ormoshe35@';
const ADMIN_PASSWORD = 'admin123456';
const ADMIN_TELEGRAM_ID = 2138564172;

export function useStrictTelegramAuth(): AuthState & { 
  handleAdminLogin: (username: string, password: string) => boolean 
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    accessDeniedReason: null,
    needsLogin: false,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  };

  const createAdminUser = (): TelegramUser => {
    return {
      id: ADMIN_TELEGRAM_ID,
      first_name: "Or",
      last_name: "Moshe",
      username: "ormoshe35",
      language_code: "en"
    };
  };

  const isGenuineTelegramEnvironment = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check for Telegram WebApp object
    if (!window.Telegram?.WebApp) {
      console.log('❌ No Telegram WebApp object found');
      return false;
    }

    const tg = window.Telegram.WebApp;
    
    // Check for initData - genuine Telegram apps will have this
    if (!tg.initData || tg.initData.length === 0) {
      console.log('❌ No initData found - not a genuine Telegram app');
      return false;
    }

    // Check for platform info (optional check)
    const platform = (tg as any).platform;
    if (platform && platform === 'unknown') {
      console.log('❌ Platform unknown - likely not genuine Telegram');
      return false;
    }

    // Check for version (optional check)
    const version = (tg as any).version;
    if (version && version === '1.0') {
      console.log('❌ Invalid version - likely not genuine Telegram');
      return false;
    }

    // Additional security: check for Telegram-specific properties
    if (typeof tg.ready !== 'function' || typeof tg.expand !== 'function') {
      console.log('❌ Missing Telegram WebApp methods');
      return false;
    }

    console.log('✅ Genuine Telegram environment detected');
    return true;
  };

  const validateTelegramData = (initData: string): boolean => {
    try {
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      
      if (!userParam || !authDate || !hash) {
        console.log('❌ Missing required Telegram data parameters');
        return false;
      }
      
      // Check timestamp validity (within 5 minutes for security)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (now - authDateTime > maxAge) {
        console.log('❌ Telegram data too old - possible replay attack');
        return false;
      }
      
      // Parse user data
      const user = JSON.parse(decodeURIComponent(userParam));
      if (!user.id || !user.first_name) {
        console.log('❌ Invalid user data in Telegram initData');
        return false;
      }
      
      console.log('✅ Telegram data validation passed');
      return true;
    } catch (error) {
      console.error('❌ Telegram data validation failed:', error);
      return false;
    }
  };

  const handleAdminLogin = (username: string, password: string): boolean => {
    console.log('🔐 Attempting admin login with:', { username, passwordLength: password.length });
    
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('✅ Admin credentials valid, setting up your real user profile');
      
      const adminUser = createAdminUser();

      console.log('📝 Updating auth state for admin user with your real Telegram ID');
      updateState({
        user: adminUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        needsLogin: false,
        accessDeniedReason: null,
        isTelegramEnvironment: false
      });

      // Set your real user ID in the API system
      setCurrentUserId(ADMIN_TELEGRAM_ID);

      // Store admin session for persistence
      try {
        localStorage.setItem('admin_session', JSON.stringify({
          user: adminUser,
          timestamp: Date.now()
        }));
        console.log('💾 Admin session stored with your real user ID');
      } catch (storageError) {
        console.warn('⚠️ Failed to store admin session:', storageError);
      }

      return true;
    }

    console.log('❌ Admin login failed - invalid credentials');
    return false;
  };

  const checkExistingAdminSession = (): TelegramUser | null => {
    try {
      const sessionData = localStorage.getItem('admin_session');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      const sessionAge = Date.now() - session.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        localStorage.removeItem('admin_session');
        return null;
      }

      // Make sure we set the user ID in the API system
      if (session.user?.id) {
        setCurrentUserId(session.user.id);
      }

      return session.user;
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem('admin_session');
      return null;
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting strict Telegram-only authentication...');
    
    try {
      // Check for existing admin session first
      const existingAdminUser = checkExistingAdminSession();
      if (existingAdminUser) {
        console.log('✅ Found valid admin session with your real user ID');
        updateState({
          user: existingAdminUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          needsLogin: false,
          accessDeniedReason: null,
          isTelegramEnvironment: false
        });
        initializedRef.current = true;
        return;
      }

      // Check if in genuine Telegram environment
      const isGenuineTelegram = isGenuineTelegramEnvironment();
      updateState({ isTelegramEnvironment: isGenuineTelegram });

      let authenticatedUser: TelegramUser | null = null;

      if (isGenuineTelegram) {
        const tg = window.Telegram!.WebApp;
        
        // Initialize Telegram WebApp
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          console.log('✅ Telegram WebApp ready() and expand() called');
        } catch (error) {
          console.warn('⚠️ Telegram WebApp initialization warning:', error);
        }

        // Try to extract user data from initData or initDataUnsafe
        if (tg.initData && validateTelegramData(tg.initData)) {
          // Step 1: Sign in to backend to get auth token
          try {
            console.log('🔐 Signing in to backend first...');
            const backendToken = await signInToBackend(tg.initData);
            if (backendToken) {
              console.log('✅ Backend sign-in successful, token stored');
            } else {
              console.warn('⚠️ Backend sign-in failed, continuing with verification...');
            }
          } catch (error) {
            console.warn('⚠️ Backend sign-in error:', error);
          }

          // Step 2: Try backend verification 
          try {
            const verificationResult = await verifyTelegramUser(tg.initData);
            if (verificationResult && verificationResult.success) {
              authenticatedUser = {
                id: verificationResult.user_id,
                first_name: verificationResult.user_data?.first_name || 'User',
                last_name: verificationResult.user_data?.last_name,
                username: verificationResult.user_data?.username,
                language_code: verificationResult.user_data?.language_code || 'en',
                is_premium: verificationResult.user_data?.is_premium,
                photo_url: verificationResult.user_data?.photo_url,
                phone_number: verificationResult.user_data?.phone_number
              };
              
              setCurrentUserId(verificationResult.user_id);
              console.log('✅ Backend verification successful');
            }
          } catch (error) {
            console.warn('⚠️ Backend verification failed, trying client-side:', error);
          }
        }

        // Fallback to client-side validation if backend fails
        if (!authenticatedUser && tg.initDataUnsafe?.user) {
          const unsafeUser = tg.initDataUnsafe.user;
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
            
            setCurrentUserId(unsafeUser.id);
            console.log('✅ Client-side authentication successful');
          }
        }
      }

      if (authenticatedUser) {
        updateState({
          user: authenticatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          accessDeniedReason: null,
          needsLogin: false
        });
      } else {
        // Not in Telegram environment or no valid auth - require admin login
        console.log('❌ No valid authentication - requiring admin login');
        updateState({
          isLoading: false,
          accessDeniedReason: 'login_required',
          needsLogin: true
        });
      }
      
    } catch (error) {
      console.error('❌ Strict authentication error:', error);
      updateState({
        isLoading: false,
        accessDeniedReason: 'system_error',
        error: 'Authentication system error',
        needsLogin: true
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please try again',
          needsLogin: true
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

  return {
    ...state,
    handleAdminLogin
  };
}
