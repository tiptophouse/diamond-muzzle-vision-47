
import { API_BASE_URL } from './config';
import { apiEndpoints } from './endpoints';
import { setCurrentUserId } from './config';
import { getBackendAccessToken } from './secureConfig';

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

// Store only the JWT token from FastAPI
let backendAuthToken: string | null = null;

export function getBackendAuthToken(): string | null {
  return backendAuthToken;
}

export function setBackendAuthToken(token: string | null) {
  backendAuthToken = token;
  console.log('🔐 Backend auth token', token ? 'set' : 'cleared');
}

// Enhanced backend sign-in function that returns JWT token
export async function signInToBackend(initData: string): Promise<string | null> {
  try {
    console.log('🔐 API: Signing in to FastAPI with initData');
    console.log('📤 API: Raw initData being sent to backend:', initData);
    console.log('📤 API: InitData length:', initData.length);
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided for sign-in');
      throw new Error('No Telegram authentication data provided');
    }

    // Log the parsed structure for debugging
    try {
      const urlParams = new URLSearchParams(initData);
      const parsedStructure = {
        user: urlParams.get('user'),
        auth_date: urlParams.get('auth_date'),
        hash: urlParams.get('hash'),
        query_id: urlParams.get('query_id'),
        allKeys: Array.from(urlParams.keys()),
        totalParams: urlParams.size
      };
      console.log('🔍 API: Parsed initData structure before sending:', parsedStructure);
    } catch (err) {
      console.warn('⚠️ API: Could not parse initData structure:', err);
    }

    // Validate initData format
    const urlParams = new URLSearchParams(initData);
    const requiredParams = ['user', 'auth_date', 'hash'];
    for (const param of requiredParams) {
      if (!urlParams.get(param)) {
        console.error(`🔐 API: Missing required parameter: ${param}`);
        throw new Error(`Invalid Telegram data: missing ${param}`);
      }
    }

    const requestBody = {
      init_data: initData
    };
    
    console.log('📤 API: Request body being sent to FastAPI:', requestBody);
    console.log('📤 API: Sending authentication request to FastAPI endpoint:', `${API_BASE_URL}${apiEndpoints.signIn()}`);
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.signIn()}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Platform': 'telegram-webapp',
        'X-Client-Version': '2.0.0',
      },
      mode: 'cors',
      body: JSON.stringify(requestBody),
    });

    console.log('📡 API: FastAPI response status:', response.status);
    console.log('📡 API: FastAPI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API: FastAPI sign-in failed:', response.status, errorText);
      
      let errorMessage = `Authentication failed (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorMessage;
      } catch {
        // Use default error message if JSON parsing fails
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ API: FastAPI sign-in successful');
    
    if (!result.token) {
      console.error('❌ API: No JWT token in FastAPI response');
      throw new Error('Authentication successful but no token received');
    }

    // Store the JWT token
    backendAuthToken = result.token;
    
    // Extract user ID from the response or initData for current user tracking
    try {
      const userParam = urlParams.get('user');
      if (userParam) {
        const userData = JSON.parse(decodeURIComponent(userParam));
        if (userData.id) {
          setCurrentUserId(userData.id);
          console.log('👤 API: Current user ID set to:', userData.id);
        }
      }
    } catch (error) {
      console.warn('⚠️ API: Could not extract user ID for tracking:', error);
    }

    console.log('🎫 API: JWT token received and stored');
    return result.token;
  } catch (error) {
    console.error('❌ API: Backend sign-in error:', error);
    throw error; // Re-throw to let caller handle the error
  }
}

// Strict Telegram verification - now only used for additional validation if needed
export async function verifyTelegramUser(initData: string): Promise<TelegramVerificationResponse | null> {
  try {
    console.log('🔐 API: Additional Telegram verification (if needed)');
    
    if (!initData || initData.length === 0) {
      console.error('🔐 API: No initData provided for verification');
      return null;
    }
    
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      console.error('🔐 API: No backend access token available for verification');
      return null;
    }
    
    const response = await fetch(`${API_BASE_URL}${apiEndpoints.verifyTelegram()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        init_data: initData,
        client_timestamp: Date.now(),
        security_level: 'strict',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API: Verification failed:', response.status, errorText);
      return null;
    }

    const result: TelegramVerificationResponse = await response.json();
    console.log('✅ API: Additional verification successful');
    
    return result;
  } catch (error) {
    console.error('❌ API: Verification error:', error);
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Client-Timestamp": Date.now().toString(),
    "X-Security-Level": "strict",
    "X-Client-Platform": "telegram-webapp"
  };
  
  // Use JWT token from FastAPI if available
  if (backendAuthToken) {
    headers["Authorization"] = `Bearer ${backendAuthToken}`;
    console.log('🎫 API: Using JWT token for authorization');
  } else {
    // Fallback to secure config token if JWT not available
    const fallbackToken = await getBackendAccessToken();
    if (fallbackToken) {
      headers["Authorization"] = `Bearer ${fallbackToken}`;
      console.log('🔑 API: Using fallback token for authorization');
    }
  }
  
  return headers;
}

export function getSecurityMetrics() {
  return {
    lastAuthentication: backendAuthToken ? new Date().toISOString() : null,
    authenticationStatus: !!backendAuthToken,
    tokenPresent: !!backendAuthToken,
    securityLevel: 'strict',
    platform: 'telegram-webapp'
  };
}

// Clear authentication state (for logout)
export function clearAuthState() {
  backendAuthToken = null;
  console.log('🔐 API: Authentication state cleared');
}
