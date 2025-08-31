
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

// Store backend auth token in memory
let backendAuthToken: string | null = null;

export function getBackendAuthToken(): string | null {
  console.log('🔑 Getting backend auth token:', backendAuthToken ? 'EXISTS' : 'NULL');
  return backendAuthToken;
}

export function clearBackendAuthToken(): void {
  console.log('🔑 Clearing backend auth token');
  backendAuthToken = null;
}

// THE ONLY TRUE AUTHENTICATION METHOD: Telegram initData → FastAPI sign-in → JWT
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 MAIN AUTH: Starting FastAPI backend authentication');
    console.log('🔐 MAIN AUTH: InitData length:', initData?.length || 0);
    
    if (!initData || initData.length === 0) {
      console.error('🔐 MAIN AUTH: No initData provided');
      return null;
    }

    const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;
    console.log('🔐 MAIN AUTH: Sign-in URL:', signInUrl);

    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        init_data: initData
      }),
    });

    console.log('🔐 MAIN AUTH: Response status:', response.status);
    console.log('🔐 MAIN AUTH: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 MAIN AUTH: Sign-in failed:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log('🔐 MAIN AUTH: Response data keys:', Object.keys(result));
    
    // Handle both possible token field names
    const token = result.access_token || result.token;
    
    if (token) {
      backendAuthToken = token;
      console.log('✅ MAIN AUTH: JWT token received and stored');
      
      // Set current user ID if available
      if (result.user_id) {
        setCurrentUserId(result.user_id);
        console.log('✅ MAIN AUTH: User ID set:', result.user_id);
      }
      
      return backendAuthToken;
    } else {
      console.error('🔐 MAIN AUTH: No token in response:', Object.keys(result));
      return null;
    }
  } catch (error) {
    console.error('❌ MAIN AUTH: Sign-in error:', error);
    return null;
  }
}

// Get auth headers with JWT token
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": window.location.origin,
    "X-Client-Timestamp": Date.now().toString(),
  };
  
  if (backendAuthToken) {
    headers["Authorization"] = `Bearer ${backendAuthToken}`;
    console.log('🔑 AUTH HEADERS: Added Bearer token');
  } else {
    console.warn('⚠️ AUTH HEADERS: No JWT token available');
  }
  
  return headers;
}

// Legacy function for compatibility - redirects to main auth
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  console.warn('⚠️ LEGACY AUTH: verifyTelegramUser called - redirecting to signInToBackend');
  
  const token = await signInToBackend(initData);
  if (!token) {
    return { success: false, user_id: 0, user_data: null, message: 'Authentication failed' };
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
        message: 'Success via main auth flow'
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
