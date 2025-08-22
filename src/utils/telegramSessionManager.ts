
import { validateTelegramHash, createJWTFromTelegramData } from '@/utils/jwt';

interface TelegramSession {
  userId: number;
  userData: any;
  initData: string;
  authDate: number;
  hash: string;
  jwtToken?: string;
  isValid: boolean;
  expiresAt: number;
}

class TelegramSessionManager {
  private session: TelegramSession | null = null;
  private readonly SESSION_KEY = 'telegram_session_data';
  private readonly MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as TelegramSession;
        if (this.isSessionValid(session)) {
          this.session = session;
          console.log('✅ Loaded valid session from storage');
        } else {
          console.log('⚠️ Stored session is invalid, clearing');
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('❌ Failed to load session:', error);
      this.clearSession();
    }
  }

  private saveSession(): void {
    try {
      if (this.session) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.session));
        console.log('💾 Session saved to storage');
      }
    } catch (error) {
      console.error('❌ Failed to save session:', error);
    }
  }

  private isSessionValid(session: TelegramSession): boolean {
    if (!session || !session.isValid) return false;
    
    const now = Date.now();
    if (now > session.expiresAt) {
      console.log('⏰ Session expired');
      return false;
    }

    // Validate InitData age
    const authAge = now - (session.authDate * 1000);
    if (authAge > this.MAX_AGE) {
      console.log('⏰ InitData too old');
      return false;
    }

    return true;
  }

  private validateInitData(initData: string): { isValid: boolean; userData?: any; authDate?: number; hash?: string } {
    try {
      if (!this.BOT_TOKEN) {
        console.warn('⚠️ No bot token available for validation');
        return { isValid: false };
      }

      // Validate hash
      const isHashValid = validateTelegramHash(initData, this.BOT_TOKEN);
      if (!isHashValid) {
        console.error('❌ Telegram hash validation failed');
        return { isValid: false };
      }

      // Parse data
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');

      if (!userParam || !authDate || !hash) {
        console.error('❌ Missing required InitData parameters');
        return { isValid: false };
      }

      const userData = JSON.parse(decodeURIComponent(userParam));
      const authDateTime = parseInt(authDate);

      // Check age
      const now = Date.now();
      const age = now - (authDateTime * 1000);
      if (age > this.MAX_AGE) {
        console.error('❌ InitData too old:', age / 1000, 'seconds');
        return { isValid: false };
      }

      return {
        isValid: true,
        userData,
        authDate: authDateTime,
        hash
      };
    } catch (error) {
      console.error('❌ InitData validation error:', error);
      return { isValid: false };
    }
  }

  public createSession(initData: string): boolean {
    console.log('🔐 Creating new Telegram session');
    
    const validation = this.validateInitData(initData);
    if (!validation.isValid || !validation.userData) {
      console.error('❌ Cannot create session - invalid InitData');
      return false;
    }

    try {
      // Create JWT token
      const jwtToken = this.BOT_TOKEN ? createJWTFromTelegramData(initData, this.BOT_TOKEN) : undefined;

      this.session = {
        userId: validation.userData.id,
        userData: validation.userData,
        initData,
        authDate: validation.authDate!,
        hash: validation.hash!,
        jwtToken,
        isValid: true,
        expiresAt: Date.now() + this.MAX_AGE
      };

      this.saveSession();
      console.log('✅ Session created successfully for user:', validation.userData.first_name);
      return true;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      return false;
    }
  }

  public getSession(): TelegramSession | null {
    if (this.session && this.isSessionValid(this.session)) {
      return { ...this.session };
    }
    return null;
  }

  public getCurrentUser(): any {
    const session = this.getSession();
    return session?.userData || null;
  }

  public getUserId(): number | null {
    const session = this.getSession();
    return session?.userId || null;
  }

  public getJWTToken(): string | null {
    const session = this.getSession();
    return session?.jwtToken || null;
  }

  public refreshSession(): boolean {
    console.log('🔄 Attempting to refresh session');
    
    if (typeof window === 'undefined') return false;
    
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) {
      console.error('❌ No Telegram initData available for refresh');
      return false;
    }

    return this.createSession(tg.initData);
  }

  public clearSession(): void {
    this.session = null;
    localStorage.removeItem(this.SESSION_KEY);
    console.log('🗑️ Session cleared');
  }

  public isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  public getSecurityInfo(): any {
    const session = this.getSession();
    if (!session) return null;

    const now = Date.now();
    const authAge = now - (session.authDate * 1000);
    const sessionAge = now - (session.expiresAt - this.MAX_AGE);

    return {
      userId: session.userId,
      authDate: new Date(session.authDate * 1000).toISOString(),
      authAge: Math.floor(authAge / 1000),
      sessionAge: Math.floor(sessionAge / 1000),
      expiresIn: Math.floor((session.expiresAt - now) / 1000),
      hasJWT: !!session.jwtToken,
      isValid: session.isValid
    };
  }
}

// Create singleton instance
export const telegramSessionManager = new TelegramSessionManager();

// Utility functions
export function getCurrentTelegramUser() {
  return telegramSessionManager.getCurrentUser();
}

export function getCurrentUserId() {
  return telegramSessionManager.getUserId();
}

export function isTelegramAuthenticated() {
  return telegramSessionManager.isAuthenticated();
}

export function refreshTelegramSession() {
  return telegramSessionManager.refreshSession();
}

export function clearTelegramSession() {
  telegramSessionManager.clearSession();
}

export function getTelegramJWT() {
  return telegramSessionManager.getJWTToken();
}
