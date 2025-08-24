
import OptimizedAuthService from './OptimizedAuthService';

export async function getOptimizedAuthHeaders(): Promise<Record<string, string>> {
  const authService = OptimizedAuthService.getInstance();
  const token = authService.getValidToken();
  const userId = authService.getUserId();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "optimized",
    "X-Auth-Version": "2.0",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('✅ Using optimized JWT token for API request');
  } else {
    console.warn('⚠️ No valid JWT token available for API request');
  }
  
  if (userId) {
    headers["X-User-ID"] = userId.toString();
  }
  
  return headers;
}

export function clearOptimizedAuth(): void {
  const authService = OptimizedAuthService.getInstance();
  authService.clearAuthCache();
  console.log('🧹 Optimized authentication cleared');
}
