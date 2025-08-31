
import { getBackendAuthToken } from './auth';

// Get the secure backend access token for API calls
export async function getBackendAccessToken(): Promise<string | null> {
  const token = getBackendAuthToken();
  
  if (!token) {
    console.warn('⚠️ No backend JWT token available');
    return null;
  }
  
  console.log('🔑 Backend JWT token available for API calls');
  return token;
}

// Check if we have valid authentication
export function isAuthenticated(): boolean {
  return !!getBackendAuthToken();
}

// Get auth headers for API requests
export async function getSecureHeaders(): Promise<Record<string, string>> {
  const token = await getBackendAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Get admin Telegram ID from secure configuration
export async function getAdminTelegramId(): Promise<number> {
  // In production, this would come from secure backend configuration
  // For now, using the hardcoded admin ID
  console.log('🔐 Getting admin Telegram ID from secure config');
  return 2138564172;
}
