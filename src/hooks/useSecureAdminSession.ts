
import { useState, useEffect } from 'react';

interface AdminSession {
  sessionToken: string;
  expiresAt: string;
  isValid: boolean;
}

export function useSecureAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedSession = localStorage.getItem('secure_admin_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        const expiresAt = new Date(parsed.expiresAt);
        const now = new Date();
        
        if (expiresAt > now) {
          setSession({ ...parsed, isValid: true });
        } else {
          localStorage.removeItem('secure_admin_session');
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('secure_admin_session');
      }
    }
    setIsLoading(false);
  }, []);

  const createSession = (sessionToken: string, expiresAt: string) => {
    const newSession = {
      sessionToken,
      expiresAt,
      isValid: true
    };
    
    setSession(newSession);
    localStorage.setItem('secure_admin_session', JSON.stringify(newSession));
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem('secure_admin_session');
  };

  const isAuthenticated = session?.isValid && new Date(session.expiresAt) > new Date();

  return {
    session,
    isAuthenticated,
    isLoading,
    createSession,
    clearSession
  };
}
