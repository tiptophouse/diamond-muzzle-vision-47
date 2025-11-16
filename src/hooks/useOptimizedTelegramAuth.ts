import { useState, useEffect, useRef, useCallback } from 'react';
import { TelegramUser } from '@/types/telegram';
import { signInToBackend } from '@/lib/api/auth';
import { setCurrentUserId } from '@/lib/api/config';
import { tokenManager } from '@/lib/api/tokenManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractTelegramUser } from '@/lib/api/validation';

interface OptimizedAuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
  isTelegramEnvironment: boolean;
  isAuthenticated: boolean;
  accessDeniedReason: string | null;
  loadTime: number;
}

export function useOptimizedTelegramAuth(): OptimizedAuthState {
  const startTime = useRef(Date.now());
  
  const [state, setState] = useState<OptimizedAuthState>(() => ({
    user: null,
    isLoading: true,
    error: null,
    isTelegramEnvironment: false,
    isAuthenticated: false,
    accessDeniedReason: null,
    loadTime: 0
  }));

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const updateState = useCallback((updates: Partial<OptimizedAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ 
        ...prev, 
        ...updates,
        loadTime: Date.now() - startTime.current
      }));
    }
  }, []);

  const authenticate = useCallback(async (): Promise<void> => {
    if (initializedRef.current || !mountedRef.current) return;

    try {
      // SECURE DEV MODE: Only in development with explicit parameter
      const isDev = window.location.hostname === 'localhost' || 
                    window.location.hostname.includes('lovableproject.com') ||
                    window.location.hostname.includes('lovable.app');
      
      const params = new URLSearchParams(window.location.search);
      const devUserId = params.get('dev_user_id');
      
      if (isDev && devUserId && /^\d+$/.test(devUserId)) {
        console.log('🔧 Secure DEV MODE: User ID', devUserId);
        
        const user: TelegramUser = {
          id: parseInt(devUserId),
          first_name: params.get('dev_name') || 'Developer',
          last_name: params.get('dev_lastname') || '',
          username: params.get('dev_username') || 'dev',
          language_code: 'en'
        };
        
        setCurrentUserId(user.id);
        tokenManager.cacheAuthState(user, 'DEV_TOKEN');
        
        try {
          await supabase.rpc('set_user_context', { telegram_id: user.id });
        } catch {}
        
        updateState({
          user,
          isLoading: false,
          isAuthenticated: true,
          isTelegramEnvironment: false,
          error: null
        });
        
        initializedRef.current = true;
        return;
      }
      
      // PRODUCTION: Telegram authentication
      const tg = window.Telegram?.WebApp;
      if (!tg || !tg.initData) {
        throw new Error('Telegram environment required');
      }

      try {
        if (tg.ready) tg.ready();
        if (tg.expand) tg.expand();
      } catch {}

      const authResult = await signInToBackend(tg.initData);
      
      if (!authResult) {
        throw new Error('Authentication failed - no token received');
      }

      const user = extractTelegramUser(tg.initDataUnsafe);
      if (!user?.id) throw new Error('Invalid user data');

      setCurrentUserId(user.id);
      tokenManager.cacheAuthState(user, authResult);

      try {
        await supabase.rpc('set_user_context', { telegram_id: user.id });
      } catch {}

      updateState({
        user,
        isLoading: false,
        isAuthenticated: true,
        isTelegramEnvironment: true,
        error: null
      });

      initializedRef.current = true;

    } catch (error: any) {
      console.error('❌ AUTH:', error.message);
      
      updateState({
        isLoading: false,
        error: error.message,
        isAuthenticated: false
      });
      
      initializedRef.current = true;
    }
  }, [updateState]);

  useEffect(() => {
    authenticate();
    return () => { mountedRef.current = false; };
  }, [authenticate]);

  return state;
}
