
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';
import { getBackendAccessToken } from './secureConfig';

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

// Store verification result
let verificationResult: TelegramVerificationResponse | null = null;

export function getVerificationResult(): TelegramVerificationResponse | null {
  return verificationResult;
}

// Strict Telegram verification - no fallbacks
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Strict Telegram verification starting');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided');
      return null;
    }
    
    // Strict validation checks
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    const userParam = urlParams.get('user');
    
    if (!authDate || !hash || !userParam) {
      console.error('🔐 API: Missing required initData parameters');
      return null;
    }

    // Strict timestamp validation (5 minutes max)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes (stricter than before)
    
    if (now - authDateTime > maxAge) {
      console.error('🔐 API: InitData too old for strict validation:', (now - authDateTime) / 1000, 'seconds');
      return null;
    }
    
    // Get secure backend access token
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      console.error('🔐 API: No backend access token available');
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
      'X-Timestamp': now.toString(),
      'X-Client-Version': '2.0.0',
      'X-Security-Level': 'strict'
    };
    
    console.log('🔐 API: Sending strict verification request');
    
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
      console.error('🔐 API: Strict verification failed:', response.status, errorText);
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    
    if (!result.success) {
      console.error('🔐 API: Backend rejected verification:', result.message);
      return null;
    }
    
    console.log('✅ API: Strict Telegram verification successful');
    
    verificationResult = result;
    if (result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API: Strict verification error:', error);
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const backendToken = await getBackendAccessToken();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict"
  };
  
  if (backendToken) {
    headers["Authorization"] = `Bearer ${backendToken}`;
  }
  
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}_${Date.now()}`;
    headers["X-Telegram-Auth"] = authToken;
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
