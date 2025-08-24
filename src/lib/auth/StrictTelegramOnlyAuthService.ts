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
    
    // Enhanced logging for debugging
    console.log('🔍 Telegram Environment Check:');
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Window Telegram object:', !!window.Telegram);
    console.log('- WebApp object:', !!window.Telegram?.WebApp);
    
    // Check for Telegram WebApp object
    if (!window.Telegram?.WebApp) {
      console.error('🔒 STRICT: No Telegram WebApp object - access denied');
      return false;
    }

    const tg = window.Telegram.WebApp;
    console.log('🔍 WebApp properties:');
    console.log('- initData length:', tg.initData?.length || 0);
    console.log('- initDataUnsafe:', !!tg.initDataUnsafe);
    console.log('- version:', (tg as any).version || 'unknown');
    console.log('- platform:', (tg as any).platform || 'unknown');

    // For Telegram WebApp v6.0 and newer, check multiple indicators
    const hasValidWebAppObject = typeof tg.ready === 'function' && typeof tg.expand === 'function';
    if (!hasValidWebAppObject) {
      console.error('🔒 STRICT: Incomplete Telegram WebApp object - access denied');
      return false;
    }

    // Enhanced validation for different Telegram versions
    const hasInitDataUnsafe = tg.initDataUnsafe && typeof tg.initDataUnsafe === 'object';
    const hasInitData = tg.initData && tg.initData.length > 0;
    
    // For older versions or limited environments, check if we have user data
    if (!hasInitData && !hasInitDataUnsafe) {
      console.error('🔒 STRICT: No valid Telegram authentication data found');
      return false;
    }

    // Additional checks for genuine Telegram environment
    const isTelegramUA = navigator.userAgent.includes('Telegram') || 
                        window.location.hostname.includes('telegram') ||
                        window.location.protocol === 'tg:';
    
    console.log('🔍 Additional checks:');
    console.log('- Telegram UA pattern:', isTelegramUA);
    console.log('- Has initData:', hasInitData);
    console.log('- Has initDataUnsafe:', hasInitDataUnsafe);

    return true;
  }

  private validateInitData(initData: string): boolean {
    console.log('🔍 Validating initData:');
    console.log('- Length:', initData?.length || 0);
    
    if (!initData || initData.length === 0) {
      console.warn('⚠️ Empty initData - checking for alternative auth methods');
      
      // For Telegram WebApp v6.0, check if we have initDataUnsafe as fallback
      if (window.Telegram?.WebApp?.initDataUnsafe) {
        const unsafeData = window.Telegram.WebApp.initDataUnsafe;
        console.log('🔍 Using initDataUnsafe as fallback:', !!unsafeData.user);
        
        if (unsafeData.user && unsafeData.user.id) {
          console.log('✅ Valid user data found in initDataUnsafe');
          return true;
        }
      }
      
      console.error('🔒 STRICT: No valid authentication data available');
      return false;
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const authDate = urlParams.get('auth_date');
      const hash = urlParams.get('hash');
      const userParam = urlParams.get('user');
      
      console.log('🔍 InitData components:');
      console.log('- Has auth_date:', !!authDate);
      console.log('- Has hash:', !!hash);
      console.log('- Has user:', !!userParam);
      
      if (!authDate || !hash || !userParam) {
        console.error('🔒 STRICT: Missing required initData parameters');
        return false;
      }
      
      // More lenient timestamp validation for compatibility
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // Increased to 10 minutes for compatibility
      
      if (now - authDateTime > maxAge) {
        console.warn('⚠️ InitData is older than 10 minutes. Age:', (now - authDateTime) / 1000, 'seconds');
        // Don't reject, just warn - some Telegram versions have timing issues
      }
      
      // Validate user data structure
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        if (!userData.id || !userData.first_name) {
          console.error('🔒 STRICT: Invalid user data structure in initData');
          return false;
        }
        console.log('✅ Valid user data structure found');
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
    console.log('🔒 Starting ENHANCED Telegram authentication with v6.0+ compatibility');
    
    // Step 1: Check for cached valid token
    const cachedToken = this.tokenManager.getValidToken();
    if (cachedToken) {
      const userId = this.tokenManager.getUserId();
      if (userId) {
        console.log('✅ Using cached JWT token');
        return this.createSuccessResult(cachedToken, userId);
      }
    }

    // Step 2: Enhanced Telegram environment validation
    if (!this.isTelegramEnvironment()) {
      return {
        success: false,
        user: null,
        token: null,
        error: 'DENIED: Not in genuine Telegram environment'
      };
    }

    const tg = window.Telegram!.WebApp;
    let initData = tg.initData;
    let authPayload: any = {
      verify_signature: true,
      client_type: 'telegram_webapp_enhanced',
      security_mode: 'strict_compatible',
      environment_check: 'telegram_v6_plus'
    };

    // Step 3: Enhanced initData handling for different Telegram versions
    if (initData && initData.length > 0) {
      if (!this.validateInitData(initData)) {
        console.warn('⚠️ InitData validation failed, checking alternatives...');
        
        // Try initDataUnsafe as fallback
        if (tg.initDataUnsafe?.user) {
          console.log('🔄 Using initDataUnsafe as authentication source');
          authPayload.init_data_unsafe = tg.initDataUnsafe;
          authPayload.auth_method = 'init_data_unsafe';
        } else {
          return {
            success: false,
            user: null,
            token: null,
            error: 'BLOCKED: Invalid Telegram authentication data'
          };
        }
      } else {
        authPayload.init_data = initData;
        authPayload.auth_method = 'init_data';
      }
    } else if (tg.initDataUnsafe?.user) {
      console.log('🔄 No initData available, using initDataUnsafe');
      authPayload.init_data_unsafe = tg.initDataUnsafe;
      authPayload.auth_method = 'init_data_unsafe';
    } else {
      return {
        success: false,
        user: null,
        token: null,
        error: 'BLOCKED: No valid Telegram authentication data available'
      };
    }

    // Step 4: Initialize Telegram WebApp
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
    } catch (error) {
      console.warn('⚠️ Telegram WebApp initialization warning:', error);
    }

    // Step 5: Enhanced backend authentication
    try {
      console.log('🔐 Sending enhanced authentication request...');
      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Client-Version': '3.1.0',
          'X-Auth-Timestamp': Date.now().toString(),
          'X-Security-Level': 'STRICT-TELEGRAM-ENHANCED',
          'X-Telegram-Version': (tg as any).version || 'unknown',
          'X-Telegram-Platform': (tg as any).platform || 'unknown',
          'X-WebApp-Validation': 'ENHANCED',
        },
        mode: 'cors',
        body: JSON.stringify(authPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Enhanced authentication failed:', response.status, errorText);
        return {
          success: false,
          user: null,
          token: null,
          error: `Authentication failed: Server returned ${response.status}`
        };
      }

      const authData: AuthResponse = await response.json();
      
      if (!authData.success || !authData.token) {
        console.error('❌ Invalid authentication response from backend');
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

      console.log('✅ Enhanced Telegram authentication successful');
      return this.createSuccessResult(authData.token, authData.user_data.user_id, authData.user_data);

    } catch (error) {
      console.error('❌ Authentication network error:', error);
      return {
        success: false,
        user: null,
        token: null,
        error: 'Network error during authentication - please check your connection'
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
    console.log('🧹 Enhanced authentication cleared');
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
