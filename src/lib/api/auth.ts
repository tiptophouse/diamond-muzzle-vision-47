
import { API_BASE_URL } from './config';
import { setCurrentUserId } from './config';

export interface TelegramVerificationResponse {
  success: boolean;
  user_id: number;
  user_data: any;
  message?: string;
  security_info?: {
    timestamp_valid: boolean;
    age_seconds: number;
    replay_protected: boolean;
    signature_valid: boolean;
  };
}

// Store backend auth token
let backendAuthToken: string | null = null;

export function getBackendAuthToken(): string | null {
  return backendAuthToken;
}

// ONLY TRUE AUTHENTICATION METHOD: Telegram initData → FastAPI sign-in → JWT
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 API: Signing in to FastAPI backend with Telegram initData');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided for sign-in');
      return null;
    }

    // Use the ONLY correct sign-in endpoint
    const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;
    console.log('🔐 API: Using sign-in URL:', signInUrl);

    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Backend sign-in failed:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    
    if (result.access_token || result.token) {
      // Handle both possible response formats
      backendAuthToken = result.access_token || result.token;
      console.log('✅ API: Backend sign-in successful, JWT token stored');
      
      // Set current user ID if available in response
      if (result.user_id) {
        setCurrentUserId(result.user_id);
      }
      
      return backendAuthToken;
    } else {
      console.error('🔐 API: No token in sign-in response:', Object.keys(result));
      return null;
    }
  } catch (error) {
    console.error('❌ API: Backend sign-in error:', error);
    return null;
  }
}

// Get auth headers with JWT token
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict"
  };
  
  if (backendAuthToken) {
    headers["Authorization"] = `Bearer ${backendAuthToken}`;
  }
  
  return headers;
}

// Legacy verification function - remove if not used elsewhere
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  console.warn('⚠️ verifyTelegramUser is deprecated - use signInToBackend instead');
  
  const token = await signInToBackend(initData);
  if (!token) {
    return { success: false, user_id: 0, user_data: null, message: 'Sign-in failed' };
  }
  
  // Extract user data from initData for compatibility
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        success: true,
        user_id: user.id,
        user_data: user,
        message: 'Success via sign-in'
      };
    }
  } catch (error) {
    console.error('Failed to parse user data:', error);
  }
  
  return { success: false, user_id: 0, user_data: null, message: 'Failed to parse user data' };
}

export function getSecurityMetrics() {
  return {
    lastVerification: backendAuthToken ? new Date().toISOString() : null,
    verificationStatus: !!backendAuthToken,
    securityInfo: null,
    securityLevel: 'strict'
  };
}
