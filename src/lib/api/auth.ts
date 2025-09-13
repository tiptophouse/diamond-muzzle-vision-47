
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';
import { getBackendAccessToken } from './secureConfig';

export interface TelegramVerificationResponse {
  success: boolean;
  user_id: number;
  user_data: any;
  jwt_token: string;
  message?: string;
  security_info?: {
    timestamp_valid: boolean;
    age_seconds: number;
    replay_protected: boolean;
    signature_valid: boolean;
  };
}

// Store verification result and backend auth token
let verificationResult: TelegramVerificationResponse | null = null;
let backendAuthToken: string | null = null;

export function getVerificationResult(): TelegramVerificationResponse | null {
  return verificationResult;
}

export function getBackendAuthToken(): string | null {
  return backendAuthToken;
}

// Backend sign-in function using FastAPI /api/v1/sign-in/ endpoint
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 FastAPI: Signing in to backend with initData');
    console.log('🔐 FastAPI: Using endpoint:', `${API_BASE_URL}${apiEndpoints.signIn()}`);
    
    if (!initData || initData.length === 0) {
      console.error('🔐 FastAPI: No initData provided for sign-in');
      return null;
    }

    console.log('🔐 FastAPI: InitData length:', initData.length);
    console.log('🔐 FastAPI: Making sign-in request to FastAPI...');

    const response = await fetch(`${API_BASE_URL}${apiEndpoints.signIn()}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'X-Client-Platform': 'telegram-web-app'
      },
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData
      }),
    });

    console.log('🔐 FastAPI: Sign-in response status:', response.status);
    console.log('🔐 FastAPI: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI: Sign-in failed with status', response.status);
      console.error('❌ FastAPI: Error response:', errorText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ FastAPI: Parsed error:', errorData);
      } catch {
        console.error('❌ FastAPI: Raw error text:', errorText);
      }
      
      return null;
    }

    const result = await response.json();
    console.log('✅ FastAPI: Sign-in response received:', result);
    
    if (result.token) {
      backendAuthToken = result.token;
      console.log('✅ FastAPI: JWT token obtained and stored successfully');
      console.log('✅ FastAPI: Token length:', result.token.length);
      
      // Verify token is valid JWT format
      const tokenParts = result.token.split('.');
      if (tokenParts.length === 3) {
        console.log('✅ FastAPI: JWT token format is valid (3 parts)');
      } else {
        console.warn('⚠️ FastAPI: JWT token format might be invalid');
      }
      
      return result.token;
    } else {
      console.error('❌ FastAPI: No token in sign-in response');
      console.error('❌ FastAPI: Response structure:', Object.keys(result));
      return null;
    }
  } catch (error) {
    console.error('❌ FastAPI: Sign-in network error:', error);
    if (error instanceof Error) {
      console.error('❌ FastAPI: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 200)
      });
    }
    return null;
  }
}

// Strict Telegram verification - no fallbacks
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Secure Telegram verification starting');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided');
      return null;
    }
    
    // Use Supabase edge function for secure verification
    const { data, error } = await import('@/integrations/supabase/client').then(m => m.supabase.functions.invoke('verify-telegram-initdata', {
      body: { init_data: initData }
    }));

    if (error) {
      console.error('🔐 API: Supabase function error:', error);
      return null;
    }

    if (!data.success) {
      console.error('🔐 API: Verification failed:', data.error);
      return null;
    }

    console.log('✅ API: Secure Telegram verification successful');
    
    const result: TelegramVerificationResponse = {
      success: data.success,
      user_id: data.user_id,
      user_data: data.user_data,
      jwt_token: data.jwt_token,
      security_info: data.security_info
    };
    
    verificationResult = result;
    if (result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    // Store JWT token for API calls
    backendAuthToken = result.jwt_token;
    
    return result;
  } catch (error) {
    console.error('❌ API: Secure verification error:', error);
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Prioritize backend JWT token from FastAPI sign-in
  const authToken = backendAuthToken || await getBackendAccessToken();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict",
    "Accept": "application/json",
    "Content-Type": "application/json"
  };
  
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
    console.log('🔐 API: Using JWT token for FastAPI authentication');
  } else {
    console.warn('⚠️ API: No JWT token available - FastAPI requests may fail');
  }
  
  if (verificationResult && verificationResult.success) {
    headers["X-Telegram-User-ID"] = verificationResult.user_id.toString();
    headers["X-Telegram-Verified"] = "true";
  }
  
  return headers;
}

export function getSecurityMetrics() {
  return {
    lastVerification: verificationResult ? new Date().toISOString() : null,
    verificationStatus: verificationResult?.success || false,
    securityInfo: verificationResult?.security_info || null,
    securityLevel: 'strict'
  };
}
