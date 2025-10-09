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

// THE ONLY TRUE AUTHENTICATION METHOD: Telegram initData → HMAC Verification → FastAPI sign-in → JWT
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 SECURE AUTH: Starting cryptographically verified authentication');
    console.log('🔐 SECURE AUTH: InitData length:', initData?.length || 0);
    
    if (!initData || initData.length === 0) {
      console.error('🔐 SECURE AUTH: No initData provided');
      return null;
    }

    // STEP 1: Verify HMAC-SHA256 signature via secure edge function
    console.log('🔐 SECURE AUTH: Step 1 - Verifying HMAC signature');
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
      'verify-telegram-init-data',
      { body: { init_data: initData } }
    );

    if (verifyError || !verifyData?.success) {
      console.error('❌ SECURE AUTH: HMAC verification failed', verifyError);
      const { toast } = await import('@/components/ui/use-toast');
      toast({
        title: "❌ Security Verification Failed",
        description: "Invalid Telegram authentication signature",
        variant: "destructive",
      });
      return null;
    }

    console.log('✅ SECURE AUTH: HMAC signature verified successfully');
    console.log('🔐 SECURE AUTH: Security info:', verifyData.security_info);

    // STEP 2: Proceed with FastAPI sign-in to get JWT
    console.log('🔐 SECURE AUTH: Step 2 - Getting JWT from FastAPI backend');

    const signInUrl = `${API_BASE_URL}/api/v1/sign-in/`;
    console.log('🔐 SECURE AUTH: FastAPI sign-in URL:', signInUrl);

    const requestPayload = { init_data: initData };
    console.log('🔐 SECURE AUTH: Sending HMAC-verified initData to FastAPI');
    
    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestPayload),
    });

    console.log('🔐 SECURE AUTH: FastAPI response status:', response.status);
    console.log('🔐 SECURE AUTH: Response ok:', response.ok);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson);
        console.error('🔐 MAIN AUTH: Error JSON:', errorJson);
      } catch {
        errorDetails = await response.text();
        console.error('🔐 SECURE AUTH: Error text:', errorDetails);
      }
      console.error('🔐 SECURE AUTH: FastAPI sign-in failed:', response.status, errorDetails);
      
      const { toast } = await import('@/components/ui/use-toast');
      toast({
        title: "❌ Authentication Failed",
        description: `Backend sign-in failed (${response.status})`,
        variant: "destructive",
      });
      
      return null;
    }

    const result = await response.json();
    const token = result.token;
    
    if (token) {
      backendAuthToken = token;
      console.log('✅ SECURE AUTH: JWT token received from FastAPI');
      
      // Decode JWT to extract user info (source of truth)
      try {
        const decoded = jwtDecode<{ user_id: number; telegram_id?: number; exp: number }>(token);
        const userId = decoded.user_id;
        
        setCurrentUserId(userId);
        tokenManager.setToken(token, userId);
        console.log('✅ SECURE AUTH: User ID decoded from JWT:', userId);
        console.log('✅ SECURE AUTH: Authentication flow complete - HMAC verified + JWT issued');
        
        // Set session context for RLS policies
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.rpc('set_session_context', {
            key: 'app.current_user_id',
            value: userId.toString()
          });
          console.log('✅ SECURE AUTH: Session context set for user:', userId);
        } catch (contextError) {
          console.warn('⚠️ SECURE AUTH: Failed to set session context, continuing:', contextError);
        }
      } catch (error) {
        console.error('🔐 SECURE AUTH: Failed to decode JWT:', error);
        return null;
      }
      
      return backendAuthToken;
    } else {
      console.error('🔐 SECURE AUTH: No token in FastAPI response');
      return null;
    }
  } catch (error) {
    console.error('❌ SECURE AUTH: Authentication error:', error);
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
