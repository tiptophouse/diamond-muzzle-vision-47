
import WebApp from '@twa-dev/sdk';
import { API_BASE_URL } from '@/lib/api/config';
import { getBackendAccessToken } from '@/lib/api/secureConfig';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface AuthResult {
  success: boolean;
  user: TelegramUser | null;
  error?: string;
  jwt_token?: string;
}

class SecureTelegramAuthService {
  private static instance: SecureTelegramAuthService;
  private authResult: AuthResult | null = null;

  static getInstance(): SecureTelegramAuthService {
    if (!SecureTelegramAuthService.instance) {
      SecureTelegramAuthService.instance = new SecureTelegramAuthService();
    }
    return SecureTelegramAuthService.instance;
  }

  async authenticate(): Promise<AuthResult> {
    console.log('🔐 Starting secure Telegram authentication with official SDK');

    try {
      // Initialize WebApp using official SDK
      WebApp.ready();
      WebApp.expand();
      
      // Verify we have valid initData
      if (!WebApp.initData || WebApp.initData.length === 0) {
        throw new Error('No Telegram initData available - not in Telegram environment');
      }

      console.log('✅ Official Telegram SDK initialized');
      console.log('📱 Platform:', WebApp.platform);
      console.log('🆔 Version:', WebApp.version);

      // Get secure backend token
      const backendToken = await getBackendAccessToken();
      if (!backendToken) {
        throw new Error('Backend access token not available');
      }

      // Send initData to FastAPI for JWT validation
      const response = await fetch(`${API_BASE_URL}/auth/telegram/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendToken}`,
          'X-Telegram-Platform': WebApp.platform,
          'X-Telegram-Version': WebApp.version,
        },
        body: JSON.stringify({
          init_data: WebApp.initData,
          user_data: WebApp.initDataUnsafe?.user,
          auth_date: WebApp.initDataUnsafe?.auth_date,
          query_id: WebApp.initDataUnsafe?.query_id
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.user) {
        throw new Error(result.message || 'Authentication validation failed');
      }

      // Store successful authentication
      this.authResult = {
        success: true,
        user: result.user,
        jwt_token: result.jwt_token
      };

      console.log('✅ Secure Telegram authentication successful');
      return this.authResult;

    } catch (error) {
      console.error('❌ Telegram authentication failed:', error);
      
      const authError: AuthResult = {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : 'Unknown authentication error'
      };

      this.authResult = authError;
      return authError;
    }
  }

  getAuthResult(): AuthResult | null {
    return this.authResult;
  }

  isAuthenticated(): boolean {
    return this.authResult?.success === true && this.authResult.user !== null;
  }

  getUser(): TelegramUser | null {
    return this.authResult?.user || null;
  }

  getJwtToken(): string | null {
    return this.authResult?.jwt_token || null;
  }

  clearAuth(): void {
    this.authResult = null;
  }
}

export const telegramAuth = SecureTelegramAuthService.getInstance();
