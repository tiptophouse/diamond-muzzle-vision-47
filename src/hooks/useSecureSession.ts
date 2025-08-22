
import { useState, useEffect, useRef } from 'react';
import { sessionManager } from '@/utils/SessionManager';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface SessionState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<void>;
}

export function useSecureSession(): SessionState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: telegramUser } = useTelegramAuth();
  const initRef = useRef(false);

  const initializeSession = async () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      console.log('🔐 Initializing secure session...');
      
      // If we have a Telegram user, create/update session
      if (telegramUser) {
        console.log('📱 Creating session from Telegram user:', telegramUser.first_name);
        const result = await sessionManager.createSession(telegramUser);
        
        if (result.isValid && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          setError(null);
        } else {
          setError(result.error || 'Failed to create session');
          setIsAuthenticated(false);
        }
      } else {
        // Try to validate existing session
        const result = await sessionManager.validateSession();
        
        if (result.isValid && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          setError(null);
        } else {
          setError(result.error || 'No valid session');
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      console.error('❌ Session initialization failed:', err);
      setError('Session initialization failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sessionManager.validateSession();
      
      if (result.isValid && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Session refresh failed');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Session refresh failed:', err);
      setError('Session refresh failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated) return false;
    return sessionManager.hasPermission(permission);
  };

  useEffect(() => {
    initializeSession();
  }, [telegramUser?.id]);

  // Auto-refresh session every 30 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing session...');
      refreshSession();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    hasPermission,
    refreshSession
  };
}
