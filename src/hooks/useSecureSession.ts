
import { useEffect, useState, useCallback } from 'react';
import { telegramSessionManager } from '@/utils/telegramSessionManager';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface SessionState {
  isAuthenticated: boolean;
  user: any;
  userId: number | null;
  jwtToken: string | null;
  securityInfo: any;
  isLoading: boolean;
  error: string | null;
}

export function useSecureSession() {
  const { user: authUser, isAuthenticated: authIsAuthenticated, isTelegramEnvironment } = useTelegramAuth();
  const [sessionState, setSessionState] = useState<SessionState>({
    isAuthenticated: false,
    user: null,
    userId: null,
    jwtToken: null,
    securityInfo: null,
    isLoading: true,
    error: null
  });

  const updateSessionState = useCallback(() => {
    try {
      const session = telegramSessionManager.getSession();
      const isAuth = telegramSessionManager.isAuthenticated();
      const currentUser = telegramSessionManager.getCurrentUser();
      const userId = telegramSessionManager.getUserId();
      const jwt = telegramSessionManager.getJWTToken();
      const secInfo = telegramSessionManager.getSecurityInfo();

      setSessionState({
        isAuthenticated: isAuth,
        user: currentUser,
        userId,
        jwtToken: jwt,
        securityInfo: secInfo,
        isLoading: false,
        error: null
      });

      console.log('📊 Session state updated:', {
        isAuthenticated: isAuth,
        userId,
        hasJWT: !!jwt,
        securityInfo: secInfo
      });
    } catch (error) {
      console.error('❌ Failed to update session state:', error);
      setSessionState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Session error'
      }));
    }
  }, []);

  const initializeSession = useCallback(() => {
    console.log('🔐 Initializing secure session');

    // If we have authenticated user from Telegram context, create session
    if (authUser && authIsAuthenticated && isTelegramEnvironment) {
      if (typeof window !== 'undefined') {
        const tg = window.Telegram?.WebApp;
        if (tg?.initData) {
          const success = telegramSessionManager.createSession(tg.initData);
          if (!success) {
            console.warn('⚠️ Failed to create session from InitData');
          }
        }
      }
    }

    updateSessionState();
  }, [authUser, authIsAuthenticated, isTelegramEnvironment, updateSessionState]);

  const refreshSession = useCallback(() => {
    console.log('🔄 Refreshing secure session');
    const success = telegramSessionManager.refreshSession();
    updateSessionState();
    return success;
  }, [updateSessionState]);

  const clearSession = useCallback(() => {
    console.log('🗑️ Clearing secure session');
    telegramSessionManager.clearSession();
    updateSessionState();
  }, [updateSessionState]);

  // Initialize session on mount and when auth context changes
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Set up periodic session validation
  useEffect(() => {
    const validateInterval = setInterval(() => {
      if (sessionState.isAuthenticated) {
        const session = telegramSessionManager.getSession();
        if (!session) {
          console.log('⚠️ Session became invalid, updating state');
          updateSessionState();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(validateInterval);
  }, [sessionState.isAuthenticated, updateSessionState]);

  return {
    ...sessionState,
    refreshSession,
    clearSession,
    getAuthHeaders: () => {
      const headers: Record<string, string> = {};
      if (sessionState.jwtToken) {
        headers['Authorization'] = `Bearer ${sessionState.jwtToken}`;
      }
      if (sessionState.userId) {
        headers['X-Telegram-User-ID'] = sessionState.userId.toString();
      }
      headers['X-Client-Timestamp'] = Date.now().toString();
      return headers;
    }
  };
}
