
import { telegramSessionManager } from '@/utils/telegramSessionManager';
import { API_BASE_URL } from './config';

interface SecureRequestOptions extends RequestInit {
  requireAuth?: boolean;
  useJWT?: boolean;
}

class SecureApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getSecureHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Timestamp': Date.now().toString(),
      'X-Client-Version': '2.0.0',
      'X-Security-Level': 'telegram-strict'
    };

    const session = telegramSessionManager.getSession();
    if (session) {
      headers['X-Telegram-User-ID'] = session.userId.toString();
      headers['X-Telegram-Auth-Date'] = session.authDate.toString();
      headers['X-Session-Hash'] = session.hash;

      if (session.jwtToken) {
        headers['Authorization'] = `Bearer ${session.jwtToken}`;
      }
    }

    return headers;
  }

  private async validateSession(): Promise<boolean> {
    const session = telegramSessionManager.getSession();
    if (!session) {
      console.error('🔒 No valid session for API request');
      return false;
    }

    return true;
  }

  async request<T = any>(
    endpoint: string, 
    options: SecureRequestOptions = {}
  ): Promise<T> {
    const { requireAuth = true, useJWT = true, ...fetchOptions } = options;

    console.log(`🌐 Secure API Request: ${endpoint}`);

    // Validate session if auth is required
    if (requireAuth) {
      const isValid = await this.validateSession();
      if (!isValid) {
        throw new Error('Authentication required - invalid session');
      }
    }

    // Prepare headers
    const headers = {
      ...this.getSecureHeaders(),
      ...fetchOptions.headers
    };

    // Make request
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
      mode: 'cors'
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error [${response.status}]:`, errorText);
      
      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        console.log('🔄 Auth error - attempting session refresh');
        const refreshed = telegramSessionManager.refreshSession();
        if (!refreshed) {
          throw new Error('Authentication failed - please restart the app');
        }
      }
      
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`);
    return data;
  }

  async get<T = any>(endpoint: string, options: SecureRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options: SecureRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async put<T = any>(endpoint: string, body?: any, options: SecureRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async delete<T = any>(endpoint: string, options: SecureRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Telegram-specific methods
  async authenticateWithTelegram(initData: string): Promise<any> {
    console.log('🔐 Authenticating with Telegram InitData');
    
    return this.post('/auth/telegram/verify', {
      init_data: initData,
      client_timestamp: Date.now(),
      security_level: 'strict'
    }, {
      requireAuth: false
    });
  }

  async refreshTelegramAuth(): Promise<any> {
    const session = telegramSessionManager.getSession();
    if (!session) {
      throw new Error('No session to refresh');
    }

    return this.post('/auth/telegram/refresh', {
      current_session: session.hash,
      user_id: session.userId
    });
  }

  getSessionInfo() {
    return telegramSessionManager.getSecurityInfo();
  }
}

// Create singleton instance
export const secureApiClient = new SecureApiClient(API_BASE_URL);

// Utility functions
export async function secureRequest<T = any>(endpoint: string, options: SecureRequestOptions = {}): Promise<T> {
  return secureApiClient.request<T>(endpoint, options);
}

export async function authenticateWithTelegram(initData: string): Promise<any> {
  return secureApiClient.authenticateWithTelegram(initData);
}

export async function refreshTelegramAuth(): Promise<any> {
  return secureApiClient.refreshTelegramAuth();
}
