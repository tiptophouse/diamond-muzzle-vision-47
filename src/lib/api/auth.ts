
import { API_BASE_URL, getBackendAccessToken } from './config';
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

// Enhanced verification with Telegram InitData
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Starting Telegram InitData verification');
    console.log('🔐 API: Sending to:', `${API_BASE_URL}${apiEndpoints.verifyTelegram()}`);
    console.log('🔐 API: InitData length:', initData.length);
    
    const backendAccessToken = await getBackendAccessToken();
    if (!backendAccessToken) {
      console.error('🔐 API: No backend access token available');
      verificationResult = null;
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${backendAccessToken}`,
      'X-Timestamp': Date.now().toString(),
      'X-Client-Version': '1.0.0'
    };
    
    console.log('🔐 API: Verifying Telegram InitData with backend...');
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData,
        client_timestamp: Date.now(),
        security_level: 'enhanced'
      }),
    });

    console.log('🔐 API: Verification response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Verification failed with status:', response.status, 'body:', errorText);
      verificationResult = null;
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    console.log('✅ API: Telegram InitData verification successful:', result);
    
    verificationResult = result;
    if (result.success && result.user_id) {
      console.log('✅ API: Setting current user ID from verified InitData:', result.user_id);
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API: Telegram InitData verification failed:', error);
    verificationResult = null;
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString()
  };
  
  const backendAccessToken = await getBackendAccessToken();
  if (backendAccessToken) {
    headers["Authorization"] = `Bearer ${backendAccessToken}`;
    console.log('🚀 API: Using backend access token for authenticated requests');
  } else {
    console.warn('⚠️ API: No backend access token available');
  }
  
  // Add enhanced auth headers if available from verification
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}_${Date.now()}`;
    headers["X-Telegram-Auth"] = authToken;
    headers["X-Security-Level"] = "enhanced";
    headers["X-User-ID"] = verificationResult.user_id.toString();
    console.log('🚀 API: Added Telegram user authentication headers for user:', verificationResult.user_id);
  }
  
  return headers;
}

// Security monitoring
export function getSecurityMetrics() {
  return {
    lastVerification: verificationResult ? new Date().toISOString() : null,
    verificationStatus: verificationResult?.success || false,
    securityInfo: verificationResult?.security_info || null,
    authenticatedUserId: verificationResult?.user_id || null
  };
}
