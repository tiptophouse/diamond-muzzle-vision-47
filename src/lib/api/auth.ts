
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

// Get Bearer token from Supabase secrets
async function getBearerToken(): Promise<string | null> {
  try {
    // Try to get token from Supabase edge function
    const response = await fetch('/functions/v1/get-api-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
  } catch (error) {
    console.warn('⚠️ Could not get bearer token from Supabase:', error);
  }
  
  return null;
}

// Verify Telegram user with backend
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Verifying Telegram user with backend');
    console.log('🔐 API: Sending to:', `${API_BASE_URL}${apiEndpoints.verifyTelegram()}`);
    console.log('🔐 API: InitData length:', initData.length);
    
    const bearerToken = await getBearerToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
      console.log('🔐 API: Added bearer token to verification request');
    }
    
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

export async function getAuthHeaders(): Promise<Record<string, string>> {
  let headers: Record<string, string> = {};
  
  // Try to get bearer token from Supabase
  const bearerToken = await getBearerToken();
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
    console.log('🚀 API: Added bearer token to request');
  }
  
  // Add auth headers if available from verification
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}`;
    headers["X-Telegram-Auth"] = authToken;
    console.log('🚀 API: Added telegram auth token to request');
  }
  
  return headers;
}
