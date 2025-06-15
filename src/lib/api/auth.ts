
import { API_BASE_URL, BACKEND_ACCESS_TOKEN } from './config';
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

// Store verification result
let verificationResult: TelegramVerificationResponse | null = null;

export function getVerificationResult(): TelegramVerificationResponse | null {
  return verificationResult;
}

// Enhanced verification with security logging
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Enhanced Telegram user verification starting');
    console.log('🔐 API: Sending to:', `${API_BASE_URL}${apiEndpoints.verifyTelegram()}`);
    console.log('🔐 API: InitData length:', initData.length);
    
    // Pre-validation checks
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      console.warn('🔐 API: Missing required initData parameters');
      verificationResult = null;
      return null;
    }

    // Check timestamp before sending to backend
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const age = now - authDateTime;
    
    if (age > 60000) { // 60 seconds
      console.warn('🔐 API: InitData too old for verification:', age / 1000, 'seconds');
      verificationResult = null;
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
      'X-Timestamp': now.toString(),
      'X-Client-Version': '1.0.0'
    };
    
    console.log('🔐 API: Using backend access token for verification');
    
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

    console.log('🔐 API: Verification response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Verification failed with status:', response.status, 'body:', errorText);
      
      // Log security event
      console.warn('🚫 Security Event: Verification failed', {
        status: response.status,
        initDataAge: age / 1000,
        timestamp: new Date().toISOString()
      });
      
      verificationResult = null;
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    console.log('✅ API: Enhanced Telegram verification successful:', result);
    
    // Log successful authentication
    console.log('📊 Security Event: Verification successful', {
      userId: result.user_id,
      securityInfo: result.security_info,
      timestamp: new Date().toISOString()
    });
    
    verificationResult = result;
    if (result.success && result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API: Enhanced Telegram verification failed:', error);
    
    // Log security event for monitoring
    console.warn('🚫 Security Event: Verification error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    verificationResult = null;
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${BACKEND_ACCESS_TOKEN}`,
    "X-Client-Timestamp": Date.now().toString()
  };
  
  console.log('🚀 API: Using backend access token for requests');
  
  // Add enhanced auth headers if available from verification
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}_${Date.now()}`;
    headers["X-Telegram-Auth"] = authToken;
    headers["X-Security-Level"] = "enhanced";
    console.log('🚀 API: Added enhanced telegram auth token to request');
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
