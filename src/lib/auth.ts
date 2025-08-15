
import { getTelegramInitData } from './telegram';

// Security: Memory-only token storage (no localStorage/sessionStorage)
class SecureTokenStore {
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private readonly tokenPrefix = 'tg_'; // Security marker
  
  set(token: string | null) {
    // Security: Validate token format before storing
    if (token && !this.isValidTokenFormat(token)) {
      console.warn('⚠️ Invalid token format detected');
      return;
    }
    this.token = token;
  }
  
  get(): string | null {
    return this.token;
  }
  
  clear() {
    this.token = null;
    this.refreshPromise = null;
  }
  
  setRefreshPromise(promise: Promise<string> | null) {
    this.refreshPromise = promise;
  }
  
  getRefreshPromise(): Promise<string> | null {
    return this.refreshPromise;
  }
  
  // Security: Basic JWT format validation
  private isValidTokenFormat(token: string): boolean {
    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Each part should be base64url encoded
    return parts.every(part => /^[A-Za-z0-9_-]+$/.test(part));
  }
}

// Singleton secure auth service
class SecureAuthService {
  private tokenStore = new SecureTokenStore();
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  private readonly maxSignInAttempts = 3;
  private signInAttempts = 0;
  
  // Secure sign in with Telegram initData validation
  async signIn(): Promise<string> {
    // Security: Rate limiting
    if (this.signInAttempts >= this.maxSignInAttempts) {
      throw new Error('Too many sign-in attempts. Please wait.');
    }
    
    const initData = getTelegramInitData();
    
    if (!initData) {
      throw new Error('No Telegram init data available');
    }
    
    // Security: Validate initData format
    if (!this.isValidInitData(initData)) {
      throw new Error('Invalid Telegram init data format');
    }
    
    try {
      this.signInAttempts++;
      
      const response = await fetch(`${this.baseUrl}/api/v1/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TelegramMiniApp/1.0',
        },
        body: JSON.stringify({ init_data: initData }),
      });
      
      if (!response.ok) {
        throw new Error(`Sign in failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Security: Validate response structure
      if (!data.access_token || typeof data.access_token !== 'string') {
        throw new Error('Invalid authentication response');
      }
      
      const token = data.access_token;
      
      // Security: Validate JWT structure
      if (!this.isValidJWT(token)) {
        throw new Error('Invalid JWT token received');
      }
      
      this.tokenStore.set(token);
      this.signInAttempts = 0; // Reset on success
      
      // Dispatch secure auth state change
      this.dispatchAuthStateChange(true);
      
      console.log('✅ Secure authentication successful');
      return token;
    } catch (error) {
      console.error('🚫 Sign in error:', error);
      throw error;
    }
  }
  
  // Secure token refresh (reuse sign-in with initData)
  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    const existingPromise = this.tokenStore.getRefreshPromise();
    if (existingPromise) {
      return existingPromise;
    }
    
    const refreshPromise = this.signIn();
    this.tokenStore.setRefreshPromise(refreshPromise);
    
    try {
      const token = await refreshPromise;
      return token;
    } finally {
      this.tokenStore.setRefreshPromise(null);
    }
  }
  
  // Get current token with security check
  getToken(): string | null {
    const token = this.tokenStore.get();
    
    // Security: Check if token is expired
    if (token && this.isTokenExpired()) {
      console.warn('⚠️ Token expired, clearing...');
      this.tokenStore.clear();
      return null;
    }
    
    return token;
  }
  
  // Secure sign out
  signOut() {
    this.tokenStore.clear();
    this.signInAttempts = 0;
    this.dispatchAuthStateChange(false);
    console.log('🚪 Secure sign out completed');
  }
  
  // Check if authenticated with security validation
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }
  
  // Secure JWT decode (without external library)
  getUserFromToken(): any {
    const token = this.tokenStore.get();
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      
      // Security: Validate base64url format
      if (!base64Url || !/^[A-Za-z0-9_-]+$/.test(base64Url)) {
        console.error('🚫 Invalid JWT payload format');
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // Security: Validate payload structure
      if (!payload.exp || !payload.sub) {
        console.warn('⚠️ JWT payload missing required fields');
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error('🚫 Failed to decode JWT:', error);
      return null;
    }
  }
  
  // Check if token is expired with security buffer
  isTokenExpired(): boolean {
    const user = this.getUserFromToken();
    if (!user || !user.exp) return true;
    
    // Security: Add 30 second buffer before actual expiry
    const bufferTime = 30 * 1000; // 30 seconds
    return Date.now() >= (user.exp * 1000 - bufferTime);
  }
  
  // Security: Validate initData format
  private isValidInitData(initData: string): boolean {
    try {
      // Should be URL-encoded parameters
      const params = new URLSearchParams(initData);
      
      // Must have required fields
      const hasUser = params.has('user');
      const hasHash = params.has('hash');
      const hasAuthDate = params.has('auth_date');
      
      return hasUser && hasHash && hasAuthDate;
    } catch {
      return false;
    }
  }
  
  // Security: Validate JWT structure
  private isValidJWT(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Each part should be valid base64url
    return parts.every(part => /^[A-Za-z0-9_-]+$/.test(part));
  }
  
  // Security: Safe event dispatch
  private dispatchAuthStateChange(authenticated: boolean) {
    try {
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { authenticated } 
      }));
    } catch (error) {
      console.error('Failed to dispatch auth state change:', error);
    }
  }
}

// Export singleton instance
export const authService = new SecureAuthService();
