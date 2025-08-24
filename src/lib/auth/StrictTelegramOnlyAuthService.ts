
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
      console.error('🔒 Server-side environment detected');
      return false;
    }
    
    console.log('🔍 Telegram Environment Check:');
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Window Telegram object:', !!window.Telegram);
    console.log('- WebApp object:', !!window.Telegram?.WebApp);
    
    // Basic check for Telegram WebApp object
    if (!window.Telegram?.WebApp) {
      console.error('🔒 No Telegram WebApp object found');
      return false;
    }

    const tg = window.Telegram.WebApp;
    console.log('🔍 WebApp properties:');
    console.log('- initData length:', tg.initData?.length || 0);
    console.log('- initDataUnsafe:', !!tg.initDataUnsafe);

    // Check if we have either initData or initDataUnsafe
    const hasInitData = tg.initData && tg.initData.length > 0;
    const hasInitDataUnsafe = tg.initDataUnsafe && tg.initDataUnsafe.user;
    
    if (!hasInitData && !hasInitDataUnsafe) {
      console.error('🔒 No valid Telegram authentication data found');
      return false;
    }

    console.log('✅ Telegram environment detected');
    return true;
  }

  async authenticateStrictTelegramOnly(): Promise<AuthResult> {
    console.log('🔒 Starting Telegram authentication');
    
    // Step 1: Check for cached valid token
    const cachedToken = this.tokenManager.getValidToken();
    if (cachedToken) {
      const userId = this.tokenManager.getUserId();
      if (userId) {
        console.log('✅ Using cached JWT token');
        return this.createSuccessResult(cachedToken, userId);
      }
    }

    // Step 2: Check Telegram environment
    if (!this.isTelegramEnvironment()) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'Not in Telegram environment'
      };
    }

    const tg = window.Telegram!.WebApp;
    
    // Step 3: Prepare authentication payload
    let authPayload: any = {
      verify_signature: true,
      client_type: 'telegram_webapp'
    };

    // Use initData if available, otherwise use initDataUnsafe
    if (tg.initData && tg.initData.length > 0) {
      console.log('🔐 Using initData for authentication');
      authPayload.init_data = tg.initData;
    } else if (tg.initDataUnsafe?.user) {
      console.log('🔐 Using initDataUnsafe for authentication');
      authPayload.init_data_unsafe = tg.initDataUnsafe;
    } else {
      return {
        success: false,
        user: null,
        token: null,
        error: 'No valid Telegram authentication data available'
      };
    }

    // Step 4: Initialize Telegram WebApp
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
    } catch (error) {
      console.warn('⚠️ Telegram WebApp initialization warning:', error);
    }

    // Step 5: Authenticate with FastAPI backend
    try {
      console.log('🔐 Authenticating with FastAPI backend...');
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(authPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Authentication failed:', response.status, errorText);
        return {
          success: false,
          user: null,
          token: null,
          error: `Authentication failed: ${response.status}`
        };
      }

      const authData: AuthResponse = await response.json();
      
      if (!authData.success || !authData.token) {
        console.error('❌ Invalid authentication response');
        return {
          success: false,
          user: null,
          token: null,
          error: 'Authentication validation failed'
        };
      }

      // Step 6: Store JWT token
      this.tokenManager.storeToken(
        authData.token,
        authData.expires_in,
        authData.user_data.user_id,
        authData.refresh_token
      );

      console.log('✅ Telegram authentication successful');
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
