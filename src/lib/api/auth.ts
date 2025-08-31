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

    // 🐛 DEBUG: Log detailed request information
    const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;
    const requestBody = { init_data: initData };
    
    console.log('🐛 BACKEND REQUEST DEBUG:', {
      url: signInUrl,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      bodyData: {
        init_data_length: initData.length,
        init_data_preview: initData.substring(0, 100) + '...',
        full_request_body: requestBody
      }
    });

    console.log('🔐 API: Using sign-in URL:', signInUrl);

    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(requestBody),
    });

    // 🐛 DEBUG: Log response details
    console.log('🐛 BACKEND RESPONSE DEBUG:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries([...response.headers.entries()]),
      url: response.url
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Backend sign-in failed:', response.status, errorText);
      console.log('🐛 ERROR RESPONSE BODY:', errorText);
      return null;
    }

    const result = await response.json();
    
    // 🐛 DEBUG: Log successful response
    console.log('🐛 SUCCESS RESPONSE DEBUG:', {
      responseKeys: Object.keys(result),
      hasToken: !!(result.token),
      fullResponse: result
    });
    
    // API docs show response format: { "token": "string" }
    if (result.token) {
      backendAuthToken = result.token;
      console.log('✅ API: Backend sign-in successful, JWT token stored');
      console.log('🐛 TOKEN DEBUG:', {
        tokenLength: backendAuthToken.length,
        tokenPreview: backendAuthToken.substring(0, 50) + '...'
      });
      
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
    console.log('🐛 FETCH ERROR DEBUG:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
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
