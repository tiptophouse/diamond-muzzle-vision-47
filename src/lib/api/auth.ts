
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';
import { getBackendAccessToken } from './secureConfig';
import { supabase } from '@/integrations/supabase/client';

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
    
    if (age > 300000) { // 5 minutes (as per Telegram recommendation)
      console.warn('🔐 API: InitData too old for verification:', age / 1000, 'seconds');
      verificationResult = null;
      return null;
    }
    
    console.log('🔐 API: Using proper Telegram initData validation via Supabase Edge Function');
    
    // Use Supabase Edge Function for proper validation
    const { data, error } = await supabase.functions.invoke('telegram-init-data-validation', {
      body: {
        init_data: initData,
        client_timestamp: now,
        security_level: 'enhanced'
      }
    });
    
    if (error) {
      console.error('🔐 API: Supabase Edge Function error:', error);
      verificationResult = null;
      return null;
    }
    
    if (!data || !data.success) {
      console.warn('🔐 API: Telegram validation failed:', data?.message);
      verificationResult = null;
      return null;
    }

    console.log('✅ API: Proper Telegram validation successful:', data);
    
    const result: TelegramVerificationResponse = {
      success: data.success,
      user_id: data.user_id,
      user_data: data.user_data,
      message: data.message,
      security_info: data.security_info
    };
    
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
  // Get secure backend access token
  const backendToken = await getBackendAccessToken();
  
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString()
  };
  
  if (backendToken) {
    headers["Authorization"] = `Bearer ${backendToken}`;
    console.log('🚀 API: Using secure backend access token for requests');
  } else {
    console.warn('⚠️ API: No secure backend access token available');
  }
  
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
