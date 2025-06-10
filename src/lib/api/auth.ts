
import { API_BASE_URL, getSecureAccessToken } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';

export interface TelegramVerificationResponse {
  success: boolean;
  user_id: number;
  user_data: any;
  message?: string;
}

// Store verification result
let verificationResult: TelegramVerificationResponse | null = null;

export function getVerificationResult(): TelegramVerificationResponse | null {
  return verificationResult;
}

// Verify Telegram user with backend
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Verifying Telegram user with backend');
    console.log('🔐 API: Sending to:', `${API_BASE_URL}${apiEndpoints.verifyTelegram()}`);
    console.log('🔐 API: InitData length:', initData.length);
    
    const secureToken = await getSecureAccessToken();
    
    if (!secureToken) {
      console.error('🔐 API: No secure token available for verification');
      verificationResult = null;
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${secureToken}`,
    };
    
    console.log('🔐 API: Using secure token for verification');
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData
      }),
    });

    console.log('🔐 API: Verification response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Verification failed with status:', response.status, 'body:', errorText);
      
      // Return null instead of throwing to allow fallback handling
      verificationResult = null;
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    console.log('✅ API: Telegram verification successful:', result);
    
    verificationResult = result;
    if (result.success && result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API: Telegram verification failed:', error);
    verificationResult = null;
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const secureToken = await getSecureAccessToken();
  
  const headers: Record<string, string> = {};
  
  if (secureToken) {
    headers["Authorization"] = `Bearer ${secureToken}`;
    console.log('🚀 API: Using secure token for requests');
  } else {
    console.warn('🚀 API: No secure token available for request authentication');
  }
  
  // Add auth headers if available from verification
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}`;
    headers["X-Telegram-Auth"] = authToken;
    console.log('🚀 API: Added telegram auth token to request');
  }
  
  return headers;
}
