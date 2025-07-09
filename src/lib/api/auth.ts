
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';
import { getBackendAccessToken } from './secureConfig';
import { secureLog, sanitizeUrl } from '@/utils/secureLogging';

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

// Enhanced verification with security logging
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    secureLog.debug('API: Telegram user verification starting', { 
      endpoint: sanitizeUrl(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`),
      initDataLength: initData ? initData.length : 0
    });
    
    // Pre-validation checks
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      secureLog.security('Missing required initData parameters');
      verificationResult = null;
      return null;
    }

    // Check timestamp before sending to backend
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const age = now - authDateTime;
    
    if (age > 60000) { // 60 seconds
      secureLog.security('InitData too old for verification', { ageSeconds: age / 1000 });
      verificationResult = null;
      return null;
    }
    
    // Get secure backend access token
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      secureLog.error('API: Failed to retrieve secure backend access token');
      verificationResult = null;
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
      'X-Timestamp': now.toString(),
      'X-Client-Version': '1.0.0'
    };
    
    secureLog.debug('API: Using secure backend access token for verification');
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData,
        client_timestamp: now,
        security_level: 'enhanced'
      }),
    });

    secureLog.debug('API: Verification response', { status: response.status });

    if (!response.ok) {
      const errorText = await response.text();
      secureLog.error('API: Verification failed', { 
        status: response.status,
        responseLength: errorText?.length || 0
      });
      
      // Log security event
      secureLog.security('Verification failed', {
        status: response.status,
        initDataAge: age / 1000
      });
      
      verificationResult = null;
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    secureLog.info('API: Telegram verification successful');
    
    // Log successful authentication
    secureLog.security('Verification successful', {
      hasUserId: !!result.user_id,
      hasSecurityInfo: !!result.security_info
    });
    
    verificationResult = result;
    if (result.success && result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    secureLog.error('API: Telegram verification failed', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Log security event for monitoring
    secureLog.security('Verification error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    verificationResult = null;
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Get secure backend access token
  const backendToken = await getBackendAccessToken();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString()
  };
  
  if (backendToken) {
    headers["Authorization"] = `Bearer ${backendToken}`;
    secureLog.debug('API: Using secure backend access token for requests');
  } else {
    secureLog.warn('API: No secure backend access token available');
  }
  
  // Add enhanced auth headers if available from verification
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}_${Date.now()}`;
    headers["X-Telegram-Auth"] = authToken;
    headers["X-Security-Level"] = "enhanced";
    secureLog.debug('API: Added enhanced telegram auth token to request');
  }
  
  return headers;
}

// Security monitoring
export function getSecurityMetrics() {
  return {
    lastVerification: verificationResult ? new Date().toISOString() : null,
    verificationStatus: verificationResult?.success || false,
    securityInfo: verificationResult?.security_info || null
  };
}
