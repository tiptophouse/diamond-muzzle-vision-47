
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';

export interface JWTAuthResponse {
  token: string;
  user_id?: number;
  expires_at?: number;
}

export interface JWTPayload {
  user_id: number;
  telegram_id: number;
  exp: number;
  iat: number;
}

// Store JWT token and user info
let currentJWT: string | null = null;
let currentUserId: number | null = null;
let tokenExpiry: number | null = null;

export function setJWTToken(token: string): void {
  currentJWT = token;
  
  // Decode JWT to extract user info
  try {
    const payload = decodeJWTPayload(token);
    if (payload) {
      currentUserId = payload.user_id;
      tokenExpiry = payload.exp * 1000; // Convert to milliseconds
      console.log('✅ JWT token set for user:', currentUserId, 'expires at:', new Date(tokenExpiry));
    }
  } catch (error) {
    console.error('❌ Failed to decode JWT payload:', error);
  }
}

export function getJWTToken(): string | null {
  // Check if token is expired
  if (tokenExpiry && Date.now() > tokenExpiry) {
    console.warn('⚠️ JWT token expired, clearing...');
    clearJWTToken();
    return null;
  }
  
  return currentJWT;
}

export function getCurrentJWTUserId(): number | null {
  return currentUserId;
}

export function clearJWTToken(): void {
  currentJWT = null;
  currentUserId = null;
  tokenExpiry = null;
  console.log('🔄 JWT token cleared');
}

export function isJWTValid(): boolean {
  const token = getJWTToken();
  return !!(token && currentUserId && tokenExpiry && Date.now() < tokenExpiry);
}

// Decode JWT payload (client-side only for user info extraction)
function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}

// Authenticate with FastAPI using Telegram initData
export async function authenticateWithFastAPI(initData: string): Promise<JWTAuthResponse | null> {
  try {
    console.log('🔐 Authenticating with FastAPI /api/v1/sign-in/...');
    
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI authentication failed:', response.status, errorText);
      return null;
    }

    const result: JWTAuthResponse = await response.json();
    
    if (result.token) {
      console.log('✅ FastAPI authentication successful');
      setJWTToken(result.token);
      return result;
    } else {
      console.error('❌ No token in FastAPI response');
      return null;
    }
  } catch (error) {
    console.error('❌ FastAPI authentication error:', error);
    return null;
  }
}

// Get authorization headers for API requests
export function getJWTAuthHeaders(): Record<string, string> {
  const token = getJWTToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Refresh token if needed (implement based on your backend logic)
export async function refreshJWTIfNeeded(): Promise<boolean> {
  // Check if token expires soon (within 5 minutes)
  if (tokenExpiry && (tokenExpiry - Date.now()) < 5 * 60 * 1000) {
    console.log('🔄 JWT token expires soon, refresh logic needed');
    // Implement refresh logic here based on your FastAPI backend
    return false;
  }
  
  return true;
}
