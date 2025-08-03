
import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '@/types/telegram';
import { verifyTelegramUser, signInToBackend } from '@/lib/api/auth';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  accessDeniedReason: string | null;
  supabaseUser: User | null;
  supabaseSession: Session | null;
}

export function useStrictTelegramAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    accessDeniedReason: null,
    supabaseUser: null,
    supabaseSession: null,
  });

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = (updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
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

    // Additional security checks
    const platform = (tg as any).platform;
    if (platform && platform === 'unknown') {
      console.log('❌ Platform unknown - likely not genuine Telegram');
      return false;
    }

    const version = (tg as any).version;
    if (version && version === '1.0') {
      console.log('❌ Invalid version - likely not genuine Telegram');
      return false;
    }

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

  const handleTelegramAuth = async () => {
    console.log('🔐 Starting Telegram authentication...');
    
    const isGenuineTelegram = isGenuineTelegramEnvironment();
    updateState({ isTelegramEnvironment: isGenuineTelegram });

    if (!isGenuineTelegram) {
      console.log('❌ Not in genuine Telegram environment');
      updateState({
        isLoading: false,
        accessDeniedReason: 'not_telegram',
        error: 'This app must be accessed through Telegram'
      });
      return;
    }

    const tg = window.Telegram!.WebApp;
    
    // Initialize Telegram WebApp
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
      console.log('✅ Telegram WebApp ready() and expand() called');
    } catch (error) {
      console.warn('⚠️ Telegram WebApp initialization warning:', error);
    }

    console.log('🔍 InitData available:', !!tg.initData);
    console.log('🔍 InitData length:', tg.initData?.length || 0);

    if (!tg.initData || !validateTelegramData(tg.initData)) {
      console.log('❌ Invalid or missing Telegram data');
      updateState({
        isLoading: false,
        accessDeniedReason: 'invalid_telegram_data',
        error: 'Invalid Telegram authentication data'
      });
      return;
    }

    let authenticatedUser: TelegramUser | null = null;

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
        console.log('✅ Backend verification successful');
      }
    } catch (error) {
      console.warn('⚠️ Backend verification failed, trying client-side:', error);
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
        console.log('✅ Client-side authentication successful');
      }
    }

    if (!authenticatedUser) {
      console.log('❌ No valid user data found');
      updateState({
        isLoading: false,
        accessDeniedReason: 'authentication_failed',
        error: 'Failed to authenticate with Telegram'
      });
      return;
    }

    // Success
    updateState({
      user: authenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      accessDeniedReason: null
    });
  };

  const handleWebAuth = async () => {
    console.log('🔐 Starting web authentication with Supabase...');
    
    // Check for existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      updateState({
        isLoading: false,
        error: 'Authentication error',
        accessDeniedReason: 'system_error'
      });
      return;
    }

    if (session?.user) {
      console.log('✅ Found existing web session');
      
      // Convert Supabase user to TelegramUser format for consistency
      const webUser: TelegramUser = {
        id: parseInt(session.user.id.replace(/-/g, '').substring(0, 10)), // Generate numeric ID
        first_name: session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'User',
        last_name: session.user.user_metadata?.last_name,
        username: session.user.user_metadata?.username,
        language_code: 'en',
        is_premium: false,
        photo_url: session.user.user_metadata?.avatar_url,
        phone_number: session.user.user_metadata?.phone_number
      };

      updateState({
        user: webUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessDeniedReason: null,
        supabaseUser: session.user,
        supabaseSession: session
      });
    } else {
      console.log('❌ No web session found - redirect to sign-in');
      // Instead of fallback, redirect to sign-in
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
      updateState({
        isLoading: false,
        error: 'Please sign in to continue',
        accessDeniedReason: 'authentication_required'
      });
    }
  };

  const authenticateUser = async () => {
    if (initializedRef.current || !mountedRef.current) {
      return;
    }

    console.log('🔐 Starting secure authentication...');
    
    try {
      // Check environment
      const isGenuineTelegram = isGenuineTelegramEnvironment();
      
      if (isGenuineTelegram) {
        await handleTelegramAuth();
      } else {
        await handleWebAuth();
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      updateState({
        isLoading: false,
        accessDeniedReason: 'system_error',
        error: 'Authentication system error'
      });
    } finally {
      initializedRef.current = true;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Set up Supabase auth state listener for web authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;
      
      console.log('🔐 Supabase auth state changed:', event, !!session);
      
      if (event === 'SIGNED_OUT') {
        updateState({
          supabaseUser: null,
          supabaseSession: null,
          user: null,
          isAuthenticated: false
        });
        
        // Redirect to sign-in if not in Telegram
        if (!isGenuineTelegramEnvironment() && typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Update state with new session
        const webUser: TelegramUser = {
          id: parseInt(session.user.id.replace(/-/g, '').substring(0, 10)),
          first_name: session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'User',
          last_name: session.user.user_metadata?.last_name,
          username: session.user.user_metadata?.username,
          language_code: 'en',
          is_premium: false,
          photo_url: session.user.user_metadata?.avatar_url,
          phone_number: session.user.user_metadata?.phone_number
        };

        updateState({
          user: webUser,
          isAuthenticated: true,
          supabaseUser: session.user,
          supabaseSession: session,
          error: null,
          accessDeniedReason: null
        });
      }
    });
    
    // Timeout for authentication
    const timeoutId = setTimeout(() => {
      if (state.isLoading && mountedRef.current && !initializedRef.current) {
        console.warn('⚠️ Authentication timeout');
        updateState({
          isLoading: false,
          accessDeniedReason: 'timeout',
          error: 'Authentication timeout - please try again'
        });
        initializedRef.current = true;
      }
    }, 10000); // Increased timeout for web auth

    authenticateUser();

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
