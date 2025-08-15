
import { fetchApi, api } from './api/client';
import { authService } from './auth';

// Enhanced API client with 401 retry logic
class ApiClient {
  private isRefreshing = false;
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const result = await fetchApi<T>(endpoint, options);
      
      if (result.error && result.error.includes('401')) {
        // Handle 401 error with single retry
        if (!options.headers || !(options.headers as any)._retry) {
          const refreshedToken = await this.handleTokenRefresh();
          if (refreshedToken) {
            // Retry the original request once
            const retryOptions = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${refreshedToken}`,
                _retry: true, // Mark as retry to prevent loops
              },
            };
            
            const retryResult = await fetchApi<T>(endpoint, retryOptions);
            if (retryResult.data) {
              return retryResult.data;
            }
          }
        }
        
        // If retry failed, sign out user
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
  
  private async handleTokenRefresh(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return authService.getToken();
    }
    
    this.isRefreshing = true;
    
    try {
      const token = await authService.refreshToken();
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
  
  // Convenience methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  
  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export enhanced API client
export const apiClient = new ApiClient();

// Re-export existing API for backward compatibility
export { api };
export * from './api/index';
