
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';

interface SignInResponse {
  token: string;
  user_id: number;
  expires_at?: number;
}

class TelegramAuthService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private userId: number | null = null;

  async signIn(initData: string): Promise<SignInResponse | null> {
    try {
      console.log('🔐 Signing in with Telegram init data to FastAPI...');
      console.log('🔐 API URL:', `${API_BASE_URL}${apiEndpoints.signIn()}`);
      console.log('🔐 InitData length:', initData.length);
      console.log('🔐 InitData preview:', initData.substring(0, 100) + '...');
      
      const response = await fetch(`${API_BASE_URL}${apiEndpoints.signIn()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          init_data: initData
        }),
      });

      console.log('🔐 SignIn response status:', response.status);
      console.log('🔐 SignIn response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SignIn failed:', response.status, errorText);
        return null;
      }

      const result: SignInResponse = await response.json();
      console.log('✅ SignIn successful, received token');
      
      // Store the token and user info
      this.token = result.token;
      this.userId = result.user_id;
      this.tokenExpiry = result.expires_at || (Date.now() + 24 * 60 * 60 * 1000); // Default 24h
      
      return result;
    } catch (error) {
      console.error('❌ SignIn error:', error);
      return null;
    }
  }

  getAuthToken(): string | null {
    // Check if token is expired
    if (this.tokenExpiry && Date.now() > this.tokenExpiry) {
      console.warn('⚠️ Auth token expired');
      this.clearAuth();
      return null;
    }
    
    return this.token;
  }

  getUserId(): number | null {
    return this.userId;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  clearAuth(): void {
    this.token = null;
    this.userId = null;
    this.tokenExpiry = null;
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}

export const telegramAuthService = new TelegramAuthService();
export type { SignInResponse };
