
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
      console.error('🔒 STRICT: Server-side environment detected - Telegram access denied');
      return false;
    }
    
    // ULTRA STRICT: Check User Agent for mobile Telegram patterns
    const userAgent = navigator.userAgent;
    const isTelegramUserAgent = userAgent.includes('TelegramBot') || 
                               userAgent.includes('Telegram') ||
                               window.location.hostname.includes('telegram');
    
    console.log('🔍 User Agent check:', userAgent);
    console.log('🔍 Telegram UA detected:', isTelegramUserAgent);
    
    // Strict Telegram WebApp object check
    if (!window.Telegram?.WebApp) {
      console.error('🔒 STRICT: No Telegram WebApp object - access denied');
      return false;
    }

    // Must have initData with content
    if (!window.Telegram.WebApp.initData || window.Telegram.WebApp.initData.length === 0) {
      console.error('🔒 STRICT: No initData found - not a genuine Telegram environment');
      return false;
    }

    // Additional check: Telegram WebApp must have expected properties
    const tg = window.Telegram.WebApp;
    if (!tg.initDataUnsafe || typeof tg.ready !== 'function') {
      console.error('🔒 STRICT: Incomplete Telegram WebApp object - access denied');
      return false;
    }

    return true;
  }

  private validateInitData(initData: string): boolean {
    if (!initData || initData.length === 0) {
      console.error('🔒 STRICT: Empty initData - validation failed');
      return false;
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      const userParam = urlParams.get('user');
      
      if (!authDate || !hash || !userParam) {
        console.error('🔒 STRICT: Missing required initData parameters');
        return false;
      }
      
      // ULTRA STRICT: Check timestamp validity (2 minutes max, reduced from 5)
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 2 * 60 * 1000; // 2 minutes instead of 5
      
      if (now - authDateTime > maxAge) {
        console.error('🔒 STRICT: InitData too old - possible replay attack. Age:', (now - authDateTime) / 1000, 'seconds');
        return false;
      }
      
      // Validate user data structure
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        if (!userData.id || !userData.first_name) {
          console.error('🔒 STRICT: Invalid user data structure in initData');
          return false;
        }
      } catch (e) {
        console.error('🔒 STRICT: Failed to parse user data from initData');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔒 STRICT: InitData validation error:', error);
      return false;
    }
  }

  async authenticateStrictTelegramOnly(): Promise<AuthResult> {
    console.log('🔒 Starting ULTRA-STRICT Telegram-only authentication');
    
    // Step 1: Check for cached valid token
    const cachedToken = this.tokenManager.getValidToken();
    if (cachedToken) {
      const userId = this.tokenManager.getUserId();
      if (userId) {
        console.log('✅ Using cached JWT token');
        return this.createSuccessResult(cachedToken, userId);
      }
    }

    // Step 2: ULTRA STRICT Telegram environment validation
    if (!this.isTelegramEnvironment()) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'BLOCKED: Access denied - Not in genuine Telegram environment'
      };
    }

    const tg = window.Telegram!.WebApp;
    const initData = tg.initData;

    // Step 3: ULTRA STRICT initData validation
    if (!this.validateInitData(initData)) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'BLOCKED: Invalid or suspicious Telegram authentication data'
      };
    }

    // Step 4: Initialize Telegram WebApp
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
    } catch (error) {
      console.warn('⚠️ Telegram WebApp initialization warning:', error);
    }

    // Step 5: Backend authentication - ZERO TOLERANCE
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Client-Version': '3.0.0',
          'X-Auth-Timestamp': Date.now().toString(),
          'X-Security-Level': 'ULTRA-STRICT-TELEGRAM-ONLY',
          'X-Telegram-Validation': 'REQUIRED',
        },
        mode: 'cors',
        body: JSON.stringify({
          init_data: initData,
          verify_signature: true,
          client_type: 'telegram_webapp_strict',
          security_mode: 'ultra_strict',
          environment_check: 'telegram_only'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ STRICT: Backend authentication failed:', response.status, errorText);
        return {
          success: false,
          user: null,
          token: null,
          error: `BLOCKED: Authentication rejected by security system (${response.status})`
        };
      }

      const authData: AuthResponse = await response.json();
      
      if (!authData.success || !authData.token) {
        console.error('❌ STRICT: Invalid authentication response from backend');
        return {
          success: false,
          user: null,
          token: null,
          error: 'BLOCKED: Security validation failed'
        };
      }

      // Step 6: Store JWT token
      this.tokenManager.storeToken(
        authData.token,
        authData.expires_in,
        authData.user_data.user_id,
        authData.refresh_token
      );

      console.log('✅ ULTRA-STRICT Telegram-only authentication successful');
      return this.createSuccessResult(authData.token, authData.user_data.user_id, authData.user_data);

    } catch (error) {
      console.error('❌ STRICT: Authentication network error:', error);
      return {
        success: false,
        user: null,
        token: null,
        error: 'BLOCKED: Network security error during authentication'
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
    console.log('🧹 STRICT: Authentication cleared');
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
