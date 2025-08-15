import telegramSDK from './telegramSDK';

interface SignInResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_EXPIRY_THRESHOLD = 60 * 1000; // 60 seconds
const RATE_LIMIT_WINDOW = 5 * 1000; // 5 seconds
const MAX_SIGN_IN_ATTEMPTS = 3;

class SecureAuthService {
  private token: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private signInAttempts = 0;
  private lastSignInAttempt = 0;

  private validateInput(input: string): boolean {
    if (typeof input !== 'string' || input.length < 10) {
      console.warn('⚠️ Invalid input format');
      return false;
    }
    return true;
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert seconds to milliseconds
      const now = Date.now();

      return expiry - now < TOKEN_EXPIRY_THRESHOLD;
    } catch (error) {
      console.error('❌ Failed to decode or validate token:', error);
      return true;
    }
  }

  private async performSignIn(): Promise<string | null> {
    // Rate limiting
    const now = Date.now();
    if (now - this.lastSignInAttempt < RATE_LIMIT_WINDOW) {
      this.signInAttempts++;
      if (this.signInAttempts > MAX_SIGN_IN_ATTEMPTS) {
        throw new Error('Too many sign-in attempts. Please wait.');
      }
    } else {
      this.signInAttempts = 1;
    }
    this.lastSignInAttempt = now;

    try {
      // Get init data from modern SDK
      const initData = telegramSDK.getInitData();
      
      if (!initData || !this.validateInput(initData)) {
        console.warn('⚠️ No valid init data available');
        return null;
      }

      console.log('🔐 Signing in with init data...');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          init_data: initData,
          timestamp: Date.now()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Sign-in failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token || typeof data.access_token !== 'string') {
        throw new Error('Invalid token received from server');
      }

      this.token = data.access_token;
      console.log('✅ Sign-in successful');
      return this.token;

    } catch (error) {
      console.error('❌ Sign-in error:', error);
      throw error;
    }
  }

  async signIn(): Promise<string | null> {
    if (this.token && !this.isTokenExpired()) {
      console.log('✅ Already signed in with valid token');
      return this.token;
    }

    if (this.refreshPromise) {
      console.log('🔄 Sign-in already in progress, awaiting...');
      return this.refreshPromise;
    }

    try {
      this.refreshPromise = this.performSignIn();
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async signOut(): Promise<void> {
    this.token = null;
    console.log('🚪 Signed out');
  }
}

export const authService = new SecureAuthService();
