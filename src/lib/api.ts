
import { fetchApi, api } from './api/client';
import { authService } from './auth';

// Enhanced API client with secure 401 retry logic
class SecureApiClient {
  private isRefreshing = false;
  private readonly maxRetries = 1; // Security: Limit retry attempts
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const result = await fetchApi<T>(endpoint, options);
      
      if (result.error && result.error.includes('401')) {
        // Handle 401 error with single secure retry
        const hasRetried = this.hasRetryMarker(options);
        
        if (!hasRetried) {
          console.log('🔐 401 detected, attempting token refresh...');
          const refreshedToken = await this.handleSecureTokenRefresh();
          
          if (refreshedToken) {
            // Retry the original request once with new token
            const retryOptions = this.createRetryOptions(options, refreshedToken);
            
            const retryResult = await fetchApi<T>(endpoint, retryOptions);
            if (retryResult.data) {
              console.log('✅ 401 retry successful');
              return retryResult.data;
            }
          }
        }
        
        // If retry failed or already retried, sign out for security
        console.warn('🚫 Authentication failed after retry, signing out');
        authService.signOut();
        throw new Error('Authentication failed');
      }
      
      if (result.data) {
        return result.data;
      }
      
      throw new Error(result.error || 'Request failed');
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
  
  private hasRetryMarker(options: RequestInit): boolean {
    const headers = options.headers as Record<string, string> | undefined;
    return headers?._retry === 'true';
  }
  
  private createRetryOptions(originalOptions: RequestInit, token: string): RequestInit {
    const originalHeaders = originalOptions.headers as Record<string, string> || {};
    
    // Create new headers object with proper types
    const retryHeaders: Record<string, string> = {
      ...originalHeaders,
      Authorization: `Bearer ${token}`,
      '_retry': 'true' // Mark as retry attempt
    };
    
    return {
      ...originalOptions,
      headers: retryHeaders
    };
  }
  
  private async handleSecureTokenRefresh(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      console.log('🔄 Token refresh already in progress...');
      return authService.getToken();
    }
    
    this.isRefreshing = true;
    
    try {
      console.log('🔐 Token refresh requested');
      const token = await authService.signIn();
      return token;
    } catch (error) {
      console.error('🚫 Secure token refresh failed:', error);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
  
  // Convenience methods with security validation
  get<T>(endpoint: string) {
    this.validateEndpoint(endpoint);
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T>(endpoint: string, body: any) {
    this.validateEndpoint(endpoint);
    this.validateRequestBody(body);
    
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  
  put<T>(endpoint: string, body: any) {
    this.validateEndpoint(endpoint);
    this.validateRequestBody(body);
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  
  delete<T>(endpoint: string) {
    this.validateEndpoint(endpoint);
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  
  // Security: Validate endpoint format
  private validateEndpoint(endpoint: string) {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Invalid endpoint');
    }
    
    // Basic path traversal protection
    if (endpoint.includes('..') || endpoint.includes('//')) {
      throw new Error('Invalid endpoint format');
    }
  }
  
  // Security: Basic request body validation
  private validateRequestBody(body: any) {
    if (body === null || body === undefined) return;
    
    // Prevent extremely large payloads
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Request body too large');
    }
  }
}

// Export secure API client
export const apiClient = new SecureApiClient();

// Re-export existing API for backward compatibility
export { api };
export * from './api/index';
