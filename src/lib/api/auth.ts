
import { API_BASE_URL } from './config';
import { setCurrentUserId } from './config';
import { tokenManager } from './tokenManager';

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
      
      // Extract user ID and store token in manager
      try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        
        if (userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          if (user.id) {
            setCurrentUserId(user.id);
            tokenManager.setToken(token, user.id);
            console.log('✅ MAIN AUTH: User ID extracted and token cached:', user.id);
            
            // Set session context for RLS policies
            try {
              const { supabase } = await import('@/integrations/supabase/client');
              await supabase.rpc('set_session_context', {
                key: 'app.current_user_id',
                value: user.id.toString()
              });
              console.log('✅ MAIN AUTH: Session context set for user:', user.id);
            } catch (contextError) {
              console.warn('⚠️ MAIN AUTH: Failed to set session context, continuing:', contextError);
              // Don't throw - this is not critical for basic functionality
            }
          }
        }
      } catch (error) {
        console.error('🔐 MAIN AUTH: Failed to extract user ID from initData:', error);
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
  
  // Use centralized getter so we also read from the tokenManager cache
  const token = getBackendAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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

// Development/Sandbox fallback auth: obtain a temporary API token for previews
export async function initDevAuthIfNeeded(): Promise<{ userId: number; token: string } | null> {
  try {
    const host = window.location.hostname;
    const isSandbox = host === 'localhost' || host.includes('lovable.dev');
    if (!isSandbox) return null;

    const existing = getBackendAuthToken();
    if (existing) {
      const cached = tokenManager.getCachedAuthState();
      return { userId: cached?.userId || 2138564172, token: existing };
    }

    const adminId = 2138564172; // Default admin for preview/dev
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('get-api-token', { body: {} });

    if (error || !data?.token) {
      console.warn('⚠️ DEV AUTH: Failed to fetch preview API token:', error || data);
      return null;
    }

    const token: string = data.token;
    backendAuthToken = token;
    setCurrentUserId(adminId);
    tokenManager.setToken(token, adminId);
    tokenManager.cacheAuthState(
      { id: adminId, first_name: 'Admin', username: 'admin', language_code: 'en', is_premium: true } as any,
      token
    );

    console.log('✅ DEV AUTH: Initialized with preview token for user', adminId);
    return { userId: adminId, token };
  } catch (e) {
    console.warn('⚠️ DEV AUTH: Initialization failed:', e);
    return null;
  }
}

export function getSecurityMetrics() {
  return {
    lastVerification: backendAuthToken ? new Date().toISOString() : null,
    verificationStatus: !!backendAuthToken,
    securityInfo: null,
    securityLevel: 'strict'
  };
}
