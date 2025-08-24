
import StrictTelegramOnlyAuthService from './StrictTelegramOnlyAuthService';

export async function getOptimizedAuthHeaders(): Promise<Record<string, string>> {
  const authService = StrictTelegramOnlyAuthService.getInstance();
  const token = authService.getValidToken();
  const userId = authService.getUserId();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict-telegram-only",
    "X-Auth-Version": "3.0",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('✅ Using strict Telegram-only JWT token for API request');
  } else {
    console.error('🔒 No valid JWT token available - authentication required');
    throw new Error('Authentication required - no valid token');
  }
  
  if (userId) {
    headers["X-User-ID"] = userId.toString();
  }
  
  return headers;
}

export function clearOptimizedAuth(): void {
  const authService = StrictTelegramOnlyAuthService.getInstance();
  authService.clearAuth();
  console.log('🧹 Strict authentication cleared');
}
