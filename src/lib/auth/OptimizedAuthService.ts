
import { API_BASE_URL } from '../api/config';
import JWTTokenManager from './JWTTokenManager';
import { TelegramUser } from '@/types/telegram';

interface AuthResponse {
  success: boolean;
  token: string;
  expires_in: number;
  user_data: {
    user_id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  refresh_token?: string;
}

interface AuthResult {
  success: boolean;
  user: TelegramUser | null;
  token: string | null;
  error?: string;
}

class OptimizedAuthService {
  private static instance: OptimizedAuthService;
  private tokenManager: JWTTokenManager;
  private authCache: Map<string, AuthResult> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.tokenManager = JWTTokenManager.getInstance();
  }

  static getInstance(): OptimizedAuthService {
    if (!OptimizedAuthService.instance) {
      OptimizedAuthService.instance = new OptimizedAuthService();
    }
    return OptimizedAuthService.instance;
  }

  async authenticateWithJWT(initData: string): Promise<AuthResult> {
    console.log('🚀 Starting optimized JWT authentication...');
    const startTime = Date.now();

    try {
      // Step 1: Check for valid cached token first (10ms)
      const cachedToken = this.tokenManager.getValidToken();
      if (cachedToken) {
        const userId = this.tokenManager.getUserId();
        if (userId) {
          console.log('⚡ Using cached JWT token - authentication in:', Date.now() - startTime, 'ms');
          return this.createSuccessResult(cachedToken, userId);
        }
      }

      // Step 2: Check auth cache for recent authentication
      const cacheKey = this.hashInitData(initData);
      const cachedAuth = this.authCache.get(cacheKey);
      if (cachedAuth && this.isCacheValid(cacheKey)) {
        console.log('⚡ Using cached auth result - authentication in:', Date.now() - startTime, 'ms');
        return cachedAuth;
      }

      // Step 3: Single API call for JWT authentication
      console.log('🔐 Making single API call for JWT authentication...');
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Version': '2.0.0',
          'X-Auth-Timestamp': Date.now().toString(),
        },
        mode: 'cors',
        body: JSON.stringify({
          init_data: initData,
          verify_signature: true,
          client_type: 'telegram_webapp'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ JWT authentication failed:', response.status, errorText);
        return { success: false, user: null, token: null, error: `Authentication failed: ${response.status}` };
      }

      const authData: AuthResponse = await response.json();
      
      if (!authData.success || !authData.token) {
        console.error('❌ Invalid authentication response');
        return { success: false, user: null, token: null, error: 'Invalid authentication response' };
      }

      // Step 4: Store JWT token securely
      this.tokenManager.storeToken(
        authData.token,
        authData.expires_in,
        authData.user_data.user_id,
        authData.refresh_token
      );

      // Step 5: Create user object and cache result
      const result = this.createSuccessResult(authData.token, authData.user_data.user_id, authData.user_data);
      this.authCache.set(cacheKey, result);

      const totalTime = Date.now() - startTime;
      console.log('✅ Optimized JWT authentication completed in:', totalTime, 'ms');
      
      return result;

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('❌ JWT authentication error after', totalTime, 'ms:', error);
      
      return {
        success: false,
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  private createSuccessResult(token: string, userId: number, userData?: any): AuthResult {
    const user: TelegramUser = {
      id: userId,
      first_name: userData?.first_name || 'User',
      last_name: userData?.last_name,
      username: userData?.username,
      language_code: userData?.language_code || 'en',
      is_premium: userData?.is_premium,
      photo_url: userData?.photo_url
    };

    return {
      success: true,
      user,
      token,
    };
  }

  private hashInitData(initData: string): string {
    // Simple hash for caching - in production, use a proper hash function
    return btoa(initData.substring(0, 50));
  }

  private isCacheValid(cacheKey: string): boolean {
    // Simple cache validation - could be enhanced with timestamps
    return this.authCache.has(cacheKey);
  }

  clearAuthCache(): void {
    this.authCache.clear();
    this.tokenManager.clearToken();
    console.log('🧹 Authentication cache cleared');
  }

  getValidToken(): string | null {
    return this.tokenManager.getValidToken();
  }

  isAuthenticated(): boolean {
    return this.tokenManager.isTokenValid();
  }

  getUserId(): number | null {
    return this.tokenManager.getUserId();
  }
}

export default OptimizedAuthService;
