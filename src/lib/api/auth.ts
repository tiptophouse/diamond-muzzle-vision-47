
import { API_BASE_URL } from './config';
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
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        init_data: initData
      }),
    });

    console.log('🔐 API: Verification response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Verification failed with status:', response.status, 'body:', errorText);
      throw new Error(`Verification failed: ${response.status} - ${errorText}`);
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
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  let headers: Record<string, string> = {};
  
  // Add auth headers if available
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}`;
    headers["Authorization"] = `Bearer ${authToken}`;
    console.log('🚀 API: Added auth token to request');
  }
  
  return headers;
}
