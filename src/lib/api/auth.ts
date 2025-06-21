
import { supabase } from '@/integrations/supabase/client';
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

// Secure Telegram user verification using Supabase Edge Function
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 Secure Auth: Verifying Telegram user through secure proxy');
    console.log('🔐 Secure Auth: InitData length:', initData.length);
    
    // Use the secure Supabase Edge Function for Telegram verification
    const { data: proxyResponse, error: supabaseError } = await supabase.functions.invoke('fastapi-proxy', {
      body: {
        endpoint: apiEndpoints.verifyTelegram(),
        method: 'POST',
        body: {
          init_data: initData
        }
      }
    });

    if (supabaseError) {
      console.error('🔐 Secure Auth: Supabase error:', supabaseError);
      verificationResult = null;
      return null;
    }

    if (!proxyResponse || !proxyResponse.success) {
      console.error('🔐 Secure Auth: Verification failed:', proxyResponse?.error);
      verificationResult = null;
      return null;
    }

    const result: TelegramVerificationResponse = proxyResponse.data;
    console.log('✅ Secure Auth: Telegram verification successful:', result);
    
    verificationResult = result;
    if (result.success && result.user_id) {
      setCurrentUserId(result.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Secure Auth: Telegram verification failed:', error);
    verificationResult = null;
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  // SECURITY: No longer exposing backend tokens in frontend
  // Authentication is now handled securely through Supabase Edge Function
  const headers: Record<string, string> = {};
  
  console.log('🔒 Secure Auth: Using secure proxy for authentication');
  
  // Add auth headers if available from verification
  if (verificationResult && verificationResult.success) {
    const authToken = `telegram_verified_${verificationResult.user_id}`;
    headers["X-Telegram-Auth"] = authToken;
    console.log('🔒 Secure Auth: Added telegram auth token to request');
  }
  
  return headers;
}
