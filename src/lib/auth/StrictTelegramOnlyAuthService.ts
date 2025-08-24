
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

class StrictTelegramOnlyAuthService {
  private static instance: StrictTelegramOnlyAuthService;
  private tokenManager: JWTTokenManager;

  private constructor() {
    this.tokenManager = JWTTokenManager.getInstance();
  }

  static getInstance(): StrictTelegramOnlyAuthService {
    if (!StrictTelegramOnlyAuthService.instance) {
      StrictTelegramOnlyAuthService.instance = new StrictTelegramOnlyAuthService();
    }
    return StrictTelegramOnlyAuthService.instance;
  }

  private isTelegramEnvironment(): boolean {
    if (typeof window === 'undefined') {
      console.error('🔒 Server-side environment detected - Telegram access denied');
      return false;
    }
    
    // Strict Telegram environment check
    if (!window.Telegram?.WebApp) {
      console.error('🔒 No Telegram WebApp object - access denied');
      return false;
    }

    // Must have initData
    if (!window.Telegram.WebApp.initData || window.Telegram.WebApp.initData.length === 0) {
      console.error('🔒 No initData found - not a genuine Telegram environment');
      return false;
    }

    return true;
  }

  private validateInitData(initData: string): boolean {
    if (!initData || initData.length === 0) {
      console.error('🔒 Empty initData - validation failed');
      return false;
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      const userParam = urlParams.get('user');
      
      if (!authDate || !hash || !userParam) {
        console.error('🔒 Missing required initData parameters');
        return false;
      }
      
      // Check timestamp validity (5 minutes max)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 5 * 60 * 1000;
      
      if (now - authDateTime > maxAge) {
        console.error('🔒 InitData too old - possible replay attack');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔒 InitData validation error:', error);
      return false;
    }
  }

  async authenticateStrictTelegramOnly(): Promise<AuthResult> {
    console.log('🔒 Starting STRICT Telegram-only authentication');
    
    // Step 1: Check for cached valid token
    const cachedToken = this.tokenManager.getValidToken();
    if (cachedToken) {
      const userId = this.tokenManager.getUserId();
      if (userId) {
        console.log('✅ Using cached JWT token');
        return this.createSuccessResult(cachedToken, userId);
      }
    }

    // Step 2: Strict Telegram environment validation
    if (!this.isTelegramEnvironment()) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'Access denied: Not in Telegram environment'
      };
    }

    const tg = window.Telegram!.WebApp;
    const initData = tg.initData;

    // Step 3: Validate initData
    if (!this.validateInitData(initData)) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'Access denied: Invalid Telegram data'
      };
    }

    // Step 4: Initialize Telegram WebApp
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
    } catch (error) {
      console.warn('⚠️ Telegram WebApp initialization warning:', error);
    }

    // Step 5: Backend authentication - NO FALLBACKS
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Version': '2.0.0',
          'X-Auth-Timestamp': Date.now().toString(),
          'X-Security-Level': 'strict-telegram-only',
        },
        mode: 'cors',
        body: JSON.stringify({
          init_data: initData,
          verify_signature: true,
          client_type: 'telegram_webapp',
          security_mode: 'strict'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend authentication failed:', response.status, errorText);
        return {
          success: false,
          user: null,
          token: null,
          error: `Authentication failed: ${response.status}`
        };
      }

      const authData: AuthResponse = await response.json();
      
      if (!authData.success || !authData.token) {
        console.error('❌ Invalid authentication response from backend');
        return {
          success: false,
          user: null,
          token: null,
          error: 'Backend authentication failed'
        };
      }

      // Step 6: Store JWT token
      this.tokenManager.storeToken(
        authData.token,
        authData.expires_in,
        authData.user_data.user_id,
        authData.refresh_token
      );

      console.log('✅ Strict Telegram-only authentication successful');
      return this.createSuccessResult(authData.token, authData.user_data.user_id, authData.user_data);

    } catch (error) {
      console.error('❌ Authentication network error:', error);
      return {
        success: false,
        user: null,
        token: null,
        error: 'Network error during authentication'
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

  clearAuth(): void {
    this.tokenManager.clearToken();
    console.log('🧹 Authentication cleared');
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

export default StrictTelegramOnlyAuthService;
