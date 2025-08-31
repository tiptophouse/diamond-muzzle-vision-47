
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
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

// Store verification result and JWT token (primary source of truth)
let verificationResult: TelegramVerificationResponse | null = null;
let jwtAuthToken: string | null = null; // PRIMARY JWT token from FastAPI sign-in

export function getVerificationResult(): TelegramVerificationResponse | null {
  return verificationResult;
}

// CRITICAL: Primary JWT token getter - this is the source of truth
export function getBackendAuthToken(): string | null {
  return jwtAuthToken;
}

// Backend sign-in function - PRIMARY authentication method
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 API: Signing in to FastAPI backend with Telegram initData');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided for FastAPI sign-in');
      return null;
    }

    console.log('🔐 API: Making sign-in request to FastAPI endpoint');
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
      console.error('🔐 API: FastAPI sign-in failed:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    
    if (result.token) {
      jwtAuthToken = result.token; // CRITICAL: Store JWT token as primary auth
      console.log('✅ API: FastAPI sign-in successful, JWT token stored as primary auth');
      return result.token;
    } else {
      console.error('🔐 API: No JWT token in FastAPI sign-in response');
      return null;
    }
  } catch (error) {
    console.error('❌ API: FastAPI sign-in error:', error);
    return null;
  }
}

// Telegram verification with JWT priority
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Verifying Telegram user with JWT authentication priority');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided for verification');
      return null;
    }
    
    // Strict validation checks
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    const userParam = urlParams.get('user');
    
    if (!authDate || !hash || !userParam) {
      console.error('🔐 API: Missing required initData parameters for verification');
      return null;
    }

    // Strict timestamp validation (5 minutes max)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    if (now - authDateTime > maxAge) {
      console.error('🔐 API: InitData too old for verification:', (now - authDateTime) / 1000, 'seconds');
      return null;
    }
    
    // CRITICAL: Use JWT token for verification if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Timestamp': now.toString(),
      'X-Client-Version': '2.0.0',
      'X-Security-Level': 'strict'
    };

    // Add JWT authentication if available
    if (jwtAuthToken) {
      headers['Authorization'] = `Bearer ${jwtAuthToken}`;
      console.log('🔐 API: Using JWT Bearer token for verification request');
    }
    
    console.log('🔐 API: Sending verification request with JWT authentication');
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData,
        client_timestamp: now,
        security_level: 'strict',
        validation_mode: 'production'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: JWT authenticated verification failed:', response.status, errorText);
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    
    if (!result.success) {
      console.error('🔐 API: Backend rejected JWT authenticated verification:', result.message);
      return null;
    }
    
    console.log('✅ API: JWT authenticated Telegram verification successful');
    
    verificationResult = result;
    if (result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API: JWT authenticated verification error:', error);
    return null;
  }
}

// CRITICAL: Authentication headers - JWT Bearer token is primary source of truth
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict"
  };
  
  // CRITICAL: JWT token from FastAPI sign-in is the primary authentication
  if (jwtAuthToken) {
    headers["Authorization"] = `Bearer ${jwtAuthToken}`;
    console.log('🔐 API: Using primary JWT Bearer token for authentication');
  } else {
    console.warn('⚠️ API: No JWT Bearer token available - authentication may fail');
  }
  
  // Add Telegram verification info if available
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
    securityLevel: 'strict',
    jwtTokenAvailable: !!jwtAuthToken
  };
}
