import { toast } from 'sonner';

interface TokenData {
  token: string;
  expiresAt: number;
  userId: number;
  refreshAt: number;
}

interface CachedAuthState {
  token: string;
  user: any;
  expiresAt: number;
  userId: number;
}

const TOKEN_STORAGE_KEY = 'brilliant_jwt_token';
const AUTH_STATE_STORAGE_KEY = 'brilliant_auth_state';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

class TokenManager {
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        const data: TokenData = JSON.parse(stored);
        if (data.expiresAt > Date.now()) {
          this.tokenData = data;
          console.log('✅ TOKEN: Loaded valid token from storage');
        } else {
          this.clearStorage();
          console.log('🗑️ TOKEN: Expired token removed from storage');
        }
      }
    } catch (error) {
      console.warn('⚠️ TOKEN: Failed to load from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(tokenData: TokenData): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.warn('⚠️ TOKEN: Failed to save to storage:', error);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_STATE_STORAGE_KEY);
  }

  setToken(token: string, userId: number): void {
    // Estimate token expiry (30 minutes for JWT)
    const expiresAt = Date.now() + (30 * 60 * 1000);
    const refreshAt = expiresAt - TOKEN_REFRESH_THRESHOLD;
    
    this.tokenData = {
      token,
      expiresAt,
      userId,
      refreshAt
    };
    
    this.saveToStorage(this.tokenData);
    console.log('✅ TOKEN: Stored with refresh at:', new Date(refreshAt).toLocaleTimeString());
  }

  getToken(): string | null {
    if (!this.tokenData) return null;
    
    if (this.tokenData.expiresAt <= Date.now()) {
      console.log('❌ TOKEN: Expired, clearing');
      this.clear();
      return null;
    }
    
    // Check if we need to refresh soon
    if (Date.now() >= this.tokenData.refreshAt && !this.refreshPromise) {
      console.log('🔄 TOKEN: Needs refresh soon');
      this.scheduleRefresh();
    }
    
    return this.tokenData.token;
  }

  private scheduleRefresh(): void {
    // Schedule refresh in background without blocking current operations
    setTimeout(() => {
      if (this.tokenData && Date.now() >= this.tokenData.refreshAt) {
        console.log('🔄 TOKEN: Background refresh triggered');
        // Trigger refresh event for auth system to handle
        window.dispatchEvent(new CustomEvent('token-refresh-needed', {
          detail: { userId: this.tokenData.userId }
        }));
      }
    }, 1000);
  }

  needsRefresh(): boolean {
    return this.tokenData ? Date.now() >= this.tokenData.refreshAt : false;
  }

  isValid(): boolean {
    return this.tokenData ? this.tokenData.expiresAt > Date.now() : false;
  }

  clear(): void {
    this.tokenData = null;
    this.refreshPromise = null;
    this.clearStorage();
  }

  // Cache complete auth state for faster app loads
  cacheAuthState(user: any, token: string): void {
    try {
      const authState: CachedAuthState = {
        token,
        user,
        expiresAt: this.tokenData?.expiresAt || Date.now() + (30 * 60 * 1000),
        userId: user.id
      };
      localStorage.setItem(AUTH_STATE_STORAGE_KEY, JSON.stringify(authState));
      console.log('💾 AUTH: State cached for faster reload');
    } catch (error) {
      console.warn('⚠️ AUTH: Failed to cache state:', error);
    }
  }

  getCachedAuthState(): CachedAuthState | null {
    try {
      const stored = localStorage.getItem(AUTH_STATE_STORAGE_KEY);
      if (stored) {
        const authState: CachedAuthState = JSON.parse(stored);
        if (authState.expiresAt > Date.now()) {
          console.log('⚡ AUTH: Using cached state for instant load');
          return authState;
        } else {
          localStorage.removeItem(AUTH_STATE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('⚠️ AUTH: Failed to load cached state:', error);
      localStorage.removeItem(AUTH_STATE_STORAGE_KEY);
    }
    return null;
  }

  getPerformanceMetrics() {
    return {
      hasToken: !!this.tokenData,
      tokenAge: this.tokenData ? Date.now() - (this.tokenData.expiresAt - 30 * 60 * 1000) : 0,
      timeUntilExpiry: this.tokenData ? this.tokenData.expiresAt - Date.now() : 0,
      needsRefresh: this.needsRefresh(),
      hasCachedState: !!localStorage.getItem(AUTH_STATE_STORAGE_KEY)
    };
  }
}

export const tokenManager = new TokenManager();