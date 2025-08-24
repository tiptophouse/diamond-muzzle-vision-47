
import { TelegramUser } from '@/types/telegram';
import { API_BASE_URL } from '@/lib/api/config';

export interface TelegramAuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: TelegramUser;
  message?: string;
}

export interface TelegramAuthError {
  success: false;
  error: string;
  details?: string;
}

class TelegramAuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Authenticate with Telegram InitData using FastAPI endpoint
   */
  async authenticateWithInitData(initData: string): Promise<TelegramAuthResponse | TelegramAuthError> {
    try {
      console.log('🔐 Authenticating with FastAPI using InitData');
      
      if (!initData || initData.length === 0) {
        return {
          success: false,
          error: 'No InitData provided',
          details: 'Telegram InitData is required for authentication'
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          init_data: initData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        return {
          success: false,
          error: `Authentication failed (${response.status})`,
          details: errorData.detail || errorData.error || 'Unknown server error'
        };
      }

      const authData: TelegramAuthResponse = await response.json();
      
      if (authData.success && authData.access_token) {
        // Store token and set up refresh
        this.setAccessToken(authData.access_token, authData.expires_in);
        console.log('✅ FastAPI authentication successful');
        return authData;
      } else {
        return {
          success: false,
          error: 'Invalid response from server',
          details: authData.message || 'No access token received'
        };
      }
    } catch (error) {
      console.error('❌ FastAPI authentication error:', error);
      return {
        success: false,
        error: 'Authentication request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store access token and set up automatic refresh
   */
  private setAccessToken(token: string, expiresIn: number) {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
    
    // Clear existing refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Set up refresh 1 minute before expiry
    const refreshTime = Math.max((expiresIn - 60) * 1000, 30000); // Minimum 30 seconds
    this.refreshTimer = setTimeout(() => {
      this.refreshTokenIfNeeded();
    }, refreshTime);
  }

  /**
   * Get current access token if valid
   */
  getAccessToken(): string | null {
    if (!this.accessToken || !this.tokenExpiry) {
      return null;
    }

    // Check if token is expired (with 30 second buffer)
    if (Date.now() > (this.tokenExpiry - 30000)) {
      console.warn('⚠️ Access token expired or near expiry');
      this.clearToken();
      return null;
    }

    return this.accessToken;
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Clear stored token
   */
  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh token if needed (requires new InitData from Telegram)
   */
  private async refreshTokenIfNeeded() {
    console.log('🔄 Token refresh needed - requires new Telegram InitData');
    // In a real app, you would trigger a re-authentication flow here
    // For now, just clear the token to force re-authentication
    this.clearToken();
  }

  /**
   * Sign out user
   */
  signOut() {
    console.log('👋 Signing out user');
    this.clearToken();
  }
}

export const telegramAuthService = new TelegramAuthService();
