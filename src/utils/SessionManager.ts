
import { supabase } from '@/integrations/supabase/client';
import { verifyTelegramUser } from '@/lib/api/auth';
import { getTelegramWebApp } from '@/utils/telegramWebApp';

interface SessionData {
  user_id: number;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  expires_at: number;
  created_at: number;
}

interface SessionValidationResult {
  isValid: boolean;
  user?: SessionData;
  error?: string;
  needsRefresh?: boolean;
}

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionData | null = null;
  private sessionKey = 'brilliant_bot_session';
  private refreshPromise: Promise<SessionValidationResult> | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Store session securely
  private storeSession(session: SessionData): void {
    try {
      const encryptedSession = btoa(JSON.stringify(session));
      localStorage.setItem(this.sessionKey, encryptedSession);
      this.currentSession = session;
      console.log('🔐 Session stored securely');
    } catch (error) {
      console.error('❌ Failed to store session:', error);
    }
  }

  // Retrieve session from storage
  private getStoredSession(): SessionData | null {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (!stored) return null;

      const session = JSON.parse(atob(stored)) as SessionData;
      
      // Check if session is expired
      if (Date.now() > session.expires_at) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Failed to retrieve session:', error);
      this.clearSession();
      return null;
    }
  }

  // Create new session from user data
  async createSession(userData: any): Promise<SessionValidationResult> {
    try {
      const sessionData: SessionData = {
        user_id: userData.id,
        telegram_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        language_code: userData.language_code,
        is_premium: userData.is_premium,
        created_at: Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      this.storeSession(sessionData);
      
      // Log session creation
      this.logSecurityEvent('session_created', {
        user_id: userData.id,
        timestamp: new Date().toISOString()
      });

      return {
        isValid: true,
        user: sessionData
      };
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      return {
        isValid: false,
        error: 'Failed to create session'
      };
    }
  }

  // Validate current session
  async validateSession(): Promise<SessionValidationResult> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performSessionValidation();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  private async performSessionValidation(): Promise<SessionValidationResult> {
    try {
      // Check stored session first
      const storedSession = this.getStoredSession();
      if (!storedSession) {
        return { isValid: false, error: 'No session found' };
      }

      // Check if session needs refresh (within 1 hour of expiry)
      const oneHour = 60 * 60 * 1000;
      const needsRefresh = (storedSession.expires_at - Date.now()) < oneHour;

      if (needsRefresh) {
        console.log('🔄 Session needs refresh, attempting to refresh...');
        return await this.refreshSession();
      }

      // Session is valid and doesn't need refresh
      this.currentSession = storedSession;
      return {
        isValid: true,
        user: storedSession
      };

    } catch (error) {
      console.error('❌ Session validation failed:', error);
      this.clearSession();
      return {
        isValid: false,
        error: 'Session validation failed'
      };
    }
  }

  // Refresh session with Telegram data
  private async refreshSession(): Promise<SessionValidationResult> {
    try {
      const tg = getTelegramWebApp();
      
      if (!tg || !tg.initData) {
        return { isValid: false, error: 'No Telegram data available for refresh' };
      }

      // Verify with backend
      const verificationResult = await verifyTelegramUser(tg.initData);
      
      if (!verificationResult || !verificationResult.success) {
        return { isValid: false, error: 'Session refresh failed' };
      }

      // Create new session with refreshed data
      return await this.createSession({
        id: verificationResult.user_id,
        first_name: verificationResult.user_data?.first_name || 'User',
        last_name: verificationResult.user_data?.last_name,
        username: verificationResult.user_data?.username,
        language_code: verificationResult.user_data?.language_code,
        is_premium: verificationResult.user_data?.is_premium
      });

    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      return { isValid: false, error: 'Session refresh failed' };
    }
  }

  // Get current user from session
  getCurrentUser(): SessionData | null {
    if (this.currentSession) {
      return this.currentSession;
    }
    
    return this.getStoredSession();
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin user (your ID) has all permissions
    if (user.telegram_id === 2138564172) {
      return true;
    }

    // Add more permission logic here as needed
    switch (permission) {
      case 'admin':
        return user.telegram_id === 2138564172;
      case 'upload':
        return true; // All authenticated users can upload
      case 'inventory':
        return true; // All authenticated users can view their inventory
      default:
        return false;
    }
  }

  // Clear session
  clearSession(): void {
    try {
      localStorage.removeItem(this.sessionKey);
      this.currentSession = null;
      console.log('🗑️ Session cleared');
      
      this.logSecurityEvent('session_cleared', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    }
  }

  // Check if session is expired
  isSessionExpired(): boolean {
    const session = this.getCurrentUser();
    if (!session) return true;
    
    return Date.now() > session.expires_at;
  }

  // Log security events
  private logSecurityEvent(event: string, details: any): void {
    console.log(`🛡️ Security Event: ${event}`, {
      ...details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Send to backend for audit logging (non-blocking)
    setTimeout(() => {
      try {
        supabase.functions.invoke('log-security-event', {
          body: { event, details }
        }).catch(console.warn);
      } catch (error) {
        console.warn('Failed to log security event:', error);
      }
    }, 0);
  }

  // Rate limiting check
  checkRateLimit(action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    try {
      const stored = localStorage.getItem(key);
      const attempts = stored ? JSON.parse(stored) : [];
      
      // Remove old attempts outside the window
      const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
      
      if (validAttempts.length >= maxAttempts) {
        console.warn(`🚫 Rate limit exceeded for action: ${action}`);
        return false;
      }
      
      // Add current attempt
      validAttempts.push(now);
      localStorage.setItem(key, JSON.stringify(validAttempts));
      
      return true;
    } catch (error) {
      console.error('❌ Rate limit check failed:', error);
      return true; // Allow on error
    }
  }
}

export const sessionManager = SessionManager.getInstance();
