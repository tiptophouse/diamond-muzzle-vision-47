
import { API_BASE_URL } from './config';
import { setCurrentUserId } from './config';
import { tokenManager } from './tokenManager';
import { validateInitData, validateSignInResponse, extractTelegramUser, type SignInResponse } from './validation';

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

// Enhanced token management with caching
let backendAuthToken: string | null = null;

export function getBackendAuthToken(): string | null {
  // Try memory first, then token manager
  const token = backendAuthToken || tokenManager.getToken();
  console.log('🔑 Getting backend auth token:', token ? 'EXISTS' : 'NULL');
  return token;
}

export function clearBackendAuthToken(): void {
  console.log('🔑 Clearing backend auth token');
  backendAuthToken = null;
  tokenManager.clear();
}

// THE ONLY TRUE AUTHENTICATION METHOD: Telegram initData → FastAPI sign-in → JWT
// This function validates initData on the client-side before sending to backend
// Backend performs additional cryptographic validation of the Telegram signature
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 MAIN AUTH: Starting FastAPI backend authentication');
    console.log('🔐 MAIN AUTH: InitData length:', initData?.length || 0);
    
    // SECURITY: Validate initData structure before sending to backend
    try {
      validateInitData(initData);
      console.log('✅ MAIN AUTH: Client-side initData validation passed');
    } catch (validationError) {
      console.error('❌ MAIN AUTH: Client-side validation failed:', validationError);
      return null;
    }

    // Extract user data for caching (before backend call)
    const userData = extractTelegramUser(initData);
    if (!userData) {
      console.error('❌ MAIN AUTH: Failed to extract user data from initData');
      return null;
    }

    const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;
    console.log('🔐 MAIN AUTH: Calling backend sign-in endpoint');

    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        init_data: initData
      }),
    });

    console.log('🔐 MAIN AUTH: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MAIN AUTH: Backend sign-in failed:', response.status, errorText);
      
      // Log specific backend validation errors
      if (response.status === 422) {
        console.error('❌ MAIN AUTH: Backend validation error - initData format invalid');
      } else if (response.status === 401) {
        console.error('❌ MAIN AUTH: Backend authentication failed - invalid Telegram signature');
      }
      
      return null;
    }

    const rawResult = await response.json();
    
    // SECURITY: Validate backend response matches expected schema
    let result: SignInResponse;
    try {
      result = validateSignInResponse(rawResult);
      console.log('✅ MAIN AUTH: Backend response validation passed');
    } catch (validationError) {
      console.error('❌ MAIN AUTH: Backend response validation failed:', validationError);
      return null;
    }
    
    const { token, has_subscription } = result;
    
    if (token) {
      backendAuthToken = token;
      console.log('✅ MAIN AUTH: JWT token received and stored');
      console.log('📊 MAIN AUTH: User subscription status:', has_subscription ? 'ACTIVE' : 'INACTIVE');
      
      // Store user ID and token
      setCurrentUserId(userData.id);
      tokenManager.setToken(token, userData.id);
      console.log('✅ MAIN AUTH: User ID extracted and token cached:', userData.id);
      
      // Set session context for RLS policies
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.rpc('set_session_context', {
          key: 'app.current_user_id',
          value: userData.id.toString()
        });
        console.log('✅ MAIN AUTH: Session context set for RLS policies');
      } catch (contextError) {
        console.warn('⚠️ MAIN AUTH: Failed to set session context, continuing:', contextError);
        // Don't throw - this is not critical for basic functionality
      }
      
      return backendAuthToken;
    } else {
      console.error('❌ MAIN AUTH: No token in validated response');
      return null;
    }
  } catch (error) {
    console.error('❌ MAIN AUTH: Unexpected sign-in error:', error);
    return null;
  }
}

// Get auth headers with JWT token for protected endpoints
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": window.location.origin,
    "X-Client-Timestamp": Date.now().toString(),
  };
  
  if (backendAuthToken) {
    // FIXED: Use proper Bearer token format as required by FastAPI
    headers["Authorization"] = `Bearer ${backendAuthToken}`;
    console.log('🔑 AUTH HEADERS: Added Bearer token for protected endpoint');
  } else {
    console.warn('⚠️ AUTH HEADERS: No JWT token available - this will fail for protected endpoints');
  }
  
  return headers;
}

// Legacy function for compatibility - redirects to main auth
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  console.warn('⚠️ LEGACY AUTH: verifyTelegramUser called - redirecting to signInToBackend');
  
  const token = await signInToBackend(initData);
  if (!token) {
    return { success: false, user_id: 0, user_data: null, message: 'Authentication failed' };
  }
  
  // Extract user data from initData for compatibility
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        success: true,
        user_id: user.id,
        user_data: user,
        message: 'Success via main auth flow'
      };
    }
  } catch (error) {
    console.error('Failed to parse user data:', error);
  }
  
  return { success: false, user_id: 0, user_data: null, message: 'Failed to parse user data' };
}

export function getSecurityMetrics() {
  return {
    lastVerification: backendAuthToken ? new Date().toISOString() : null,
    verificationStatus: !!backendAuthToken,
    securityInfo: null,
    securityLevel: 'strict'
  };
}
