import { API_BASE_URL } from './config';
import { setCurrentUserId } from './config';
import { tokenManager } from './tokenManager';
import { jwtDecode } from 'jwt-decode';

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
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 MAIN AUTH: Starting FastAPI backend authentication');
    console.log('🔐 MAIN AUTH: InitData length:', initData?.length || 0);
    
    if (!initData || initData.length === 0) {
      console.error('🔐 MAIN AUTH: No initData provided');
      return null;
    }

    const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;
    console.log('🔐 MAIN AUTH: Sign-in URL:', signInUrl);

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
    console.log('🔐 MAIN AUTH: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 MAIN AUTH: Sign-in failed:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log('🔐 MAIN AUTH: Response data keys:', Object.keys(result));
    
    // FIXED: According to OpenAPI spec, the field is "token", not "access_token"
    const token = result.token;
    
    if (token) {
      backendAuthToken = token;
      console.log('✅ MAIN AUTH: JWT token received and stored');
      
      // Decode JWT to extract user info (source of truth)
      try {
        const decoded = jwtDecode<{ user_id: number; telegram_id?: number; exp: number }>(token);
        const userId = decoded.user_id;
        
        setCurrentUserId(userId);
        tokenManager.setToken(token, userId);
        console.log('✅ MAIN AUTH: User ID decoded from JWT:', userId);
        
        // Set session context for RLS policies
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.rpc('set_session_context', {
            key: 'app.current_user_id',
            value: userId.toString()
          });
          console.log('✅ MAIN AUTH: Session context set for user:', userId);
        } catch (contextError) {
          console.warn('⚠️ MAIN AUTH: Failed to set session context, continuing:', contextError);
        }
      } catch (error) {
        console.error('🔐 MAIN AUTH: Failed to decode JWT:', error);
        return null;
      }
      
      return backendAuthToken;
    } else {
      console.error('🔐 MAIN AUTH: No token in response:', Object.keys(result));
      return null;
    }
  } catch (error) {
    console.error('❌ MAIN AUTH: Sign-in error:', error);
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
