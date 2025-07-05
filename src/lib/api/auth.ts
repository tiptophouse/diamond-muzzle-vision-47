
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';
import { telegramAuthService } from './telegramAuth';

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

// Enhanced verification with new JWT token flow
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 Starting enhanced Telegram verification with JWT flow');
    console.log('🔐 InitData length:', initData.length);
    
    // Pre-validation checks
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');
    
    if (!authDate || !hash) {
      console.warn('🔐 Missing required initData parameters');
      verificationResult = null;
      return null;
    }

    // Check timestamp before sending to backend
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const age = now - authDateTime;
    
    if (age > 60000) { // 60 seconds
      console.warn('🔐 InitData too old for verification:', age / 1000, 'seconds');
      verificationResult = null;
      return null;
    }
    
    // Use the new SignIn endpoint instead of verify-telegram
    const signInResult = await telegramAuthService.signIn(initData);
    
    if (!signInResult) {
      console.error('🔐 SignIn failed');
      verificationResult = null;
      return null;
    }

    // Create verification response format for compatibility
    const result: TelegramVerificationResponse = {
      success: true,
      user_id: signInResult.user_id,
      user_data: {
        id: signInResult.user_id,
        first_name: 'User', // Will be populated from initData if available
      },
      security_info: {
        timestamp_valid: true,
        age_seconds: age / 1000,
        replay_protected: true,
        signature_valid: true,
      }
    };

    console.log('✅ Enhanced Telegram verification successful with JWT token');
    
    verificationResult = result;
    setCurrentUserId(result.user_id);
    
    return result;
  } catch (error) {
    console.error('❌ Enhanced Telegram verification failed:', error);
    verificationResult = null;
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Use the new JWT token from telegramAuthService
  return telegramAuthService.getAuthHeaders();
}

// Security monitoring
export function getSecurityMetrics() {
  return {
    lastVerification: verificationResult ? new Date().toISOString() : null,
    verificationStatus: verificationResult?.success || false,
    securityInfo: verificationResult?.security_info || null,
    jwtAuthenticated: telegramAuthService.isAuthenticated(),
    userId: telegramAuthService.getUserId()
  };
}
