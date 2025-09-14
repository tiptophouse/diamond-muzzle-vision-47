
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

// Backend sign-in function
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 API: Signing in to backend with initData');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided for sign-in');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}${apiEndpoints.signIn()}`, {
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
    
    if (result.token) {
      backendAuthToken = result.token;
      console.log('✅ API: Backend sign-in successful, token stored');
      return result.token;
    } else {
      console.error('🔐 API: No token in sign-in response');
      return null;
    }
  } catch (error) {
    console.error('❌ API: Backend sign-in error:', error);
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
  // Use backend auth token if available, otherwise fallback to secure config token
  const authToken = backendAuthToken || await getBackendAccessToken();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict"
  };
  
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  
  if (verificationResult && verificationResult.success) {
    const telegramAuth = `telegram_verified_${verificationResult.user_id}_${Date.now()}`;
    headers["X-Telegram-Auth"] = telegramAuth;
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
