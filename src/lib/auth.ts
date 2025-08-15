
import { getTelegramInitData } from './telegram';

// Memory-only token storage (no localStorage/sessionStorage)
class TokenStore {
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  
  set(token: string | null) {
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
}

// Singleton auth service
class AuthService {
  private tokenStore = new TokenStore();
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Sign in with Telegram initData
  async signIn(): Promise<string> {
    const initData = getTelegramInitData();
    
    if (!initData) {
      throw new Error('No Telegram init data available');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ init_data: initData }),
      });
      
      if (!response.ok) {
        throw new Error(`Sign in failed: ${response.status}`);
      }
      
      const data = await response.json();
      const token = data.access_token;
      
      this.tokenStore.set(token);
      
      // Dispatch event for auth state change
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { authenticated: true } 
      }));
      
      return token;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  // Refresh token (reuse sign-in with initData)
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
  
  // Get current token
  getToken(): string | null {
    return this.tokenStore.get();
  }
  
  // Sign out
  signOut() {
    this.tokenStore.clear();
    
    window.dispatchEvent(new CustomEvent('auth-state-changed', { 
      detail: { authenticated: false } 
    }));
  }
  
  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.tokenStore.get();
  }
  
  // Decode JWT to get user info (without external library)
  getUserFromToken(): any {
    const token = this.tokenStore.get();
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
  
  // Check if token is expired
  isTokenExpired(): boolean {
    const user = this.getUserFromToken();
    if (!user || !user.exp) return true;
    
    // Add 10 second buffer before actual expiry
    return Date.now() >= (user.exp * 1000 - 10000);
  }
}

// Export singleton instance
export const authService = new AuthService();
