
import { API_BASE_URL } from '@/lib/api/config';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_data?: any;
}

export interface AuthError {
  detail: string;
  status_code: number;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  async signInWithTelegram(initData: string): Promise<AuthResponse> {
    console.log('🔐 AuthService: Starting FastAPI JWT authentication');
    
    if (!initData || initData.length === 0) {
      throw new Error('No Telegram initData provided');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/sign-in/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        init_data: initData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: Authentication failed`);
    }

    const authResponse: AuthResponse = await response.json();
    
    if (!authResponse.access_token) {
      throw new Error('No access token received from FastAPI');
    }

    // Store the JWT token
    this.accessToken = authResponse.access_token;
    console.log('✅ AuthService: JWT token stored successfully');

    return authResponse;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.warn('🔒 JWT token expired or invalid');
      this.accessToken = null;
      throw new Error('Authentication expired');
    }

    return response;
  }

  clearAuth(): void {
    this.accessToken = null;
    console.log('🔐 AuthService: Authentication cleared');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const authService = new AuthService();
