
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { telegramAuthService } from './telegramAuth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Enhanced backend connectivity test with JWT auth
async function testBackendConnectivity(): Promise<boolean> {
  try {
    console.log('🔍 API: Testing FastAPI backend connectivity with JWT auth to:', API_BASE_URL);
    
    if (!telegramAuthService.isAuthenticated()) {
      console.warn('❌ API: No JWT token available for connectivity test');
      return false;
    }
    
    // Try the root endpoint first
    const testUrl = `${API_BASE_URL}/`;
    console.log('🔍 API: Testing root endpoint:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: telegramAuthService.getAuthHeaders(),
    });
    
    console.log('🔍 API: Root endpoint response status:', response.status);
    
    if (response.ok || response.status === 404) {
      console.log('✅ API: FastAPI backend is reachable with JWT auth');
      return true;
    }
    
    console.log('❌ API: FastAPI backend not reachable with JWT auth');
    return false;
  } catch (error) {
    console.error('❌ API: FastAPI backend connectivity test failed:', error);
    return false;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making FastAPI request:', url);
    console.log('🚀 API: Current user ID:', getCurrentUserId());
    
    // In development mode, try to authenticate as admin if not already authenticated
    if (!telegramAuthService.isAuthenticated() && process.env.NODE_ENV === 'development') {
      console.log('🔧 API: Attempting admin authentication for development...');
      const ADMIN_TELEGRAM_ID = 2138564172;
      const mockInitData = `user=%7B%22id%22%3A${ADMIN_TELEGRAM_ID}%2C%22first_name%22%3A%22Admin%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22admin%22%2C%22language_code%22%3A%22en%22%7D&auth_date=${Math.floor(Date.now() / 1000)}&hash=mock_hash`;
      
      try {
        const signInResult = await telegramAuthService.signIn(mockInitData);
        if (signInResult) {
          console.log('✅ API: Admin authentication successful for development');
        }
      } catch (error) {
        console.warn('⚠️ API: Admin authentication failed:', error);
      }
    }
    
    // Check if we have a valid JWT token after potential admin auth
    if (!telegramAuthService.isAuthenticated()) {
      const errorMsg = 'No valid JWT token available. Please sign in again.';
      console.error('❌ API: JWT token missing or expired');
      throw new Error(errorMsg);
    }
    
    // Test connectivity first
    const isBackendReachable = await testBackendConnectivity();
    if (!isBackendReachable) {
      const errorMsg = 'FastAPI backend server is not reachable. Please check if the server is running at ' + API_BASE_URL;
      console.error('❌ API: Backend unreachable');
      throw new Error(errorMsg);
    }
    
    let headers: Record<string, string> = {
      ...telegramAuthService.getAuthHeaders(),
      "Origin": window.location.origin,
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };
    
    console.log('🚀 API: Fetch options with JWT auth:', {
      url,
      method: fetchOptions.method || 'GET',
      hasJWTAuth: headers.Authorization?.startsWith('Bearer '),
      hasBody: !!fetchOptions.body,
    });
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 API: FastAPI Response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received from FastAPI');
      if (Array.isArray(data)) {
        console.log('📡 API: Array length:', data.length);
      }
    } else {
      const text = await response.text();
      console.log('📡 API: Non-JSON response from FastAPI:', text.substring(0, 200));
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `FastAPI Error ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ API: FastAPI request failed:', errorMessage);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('❌ JWT token expired or invalid, clearing auth');
        telegramAuthService.clearAuth();
        throw new Error('Authentication expired. Please refresh the app.');
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ API: FastAPI request successful with JWT auth');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: FastAPI request error:', errorMessage);
    
    // Show specific toast messages for different error types
    if (errorMessage.includes('JWT token') || errorMessage.includes('Authentication expired')) {
      toast({
        title: "🔐 Authentication Required",
        description: "Your session has expired. Please refresh the app to sign in again.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Connection Error",
        description: `Cannot reach FastAPI server at ${API_BASE_URL}. Please check your connection.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "❌ FastAPI Error",
        description: `Request failed: ${errorMessage}`,
        variant: "destructive",
      });
    }
    
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
    
  uploadCsv: async <T>(endpoint: string, csvData: any[], userId: number): Promise<ApiResponse<T>> => {
    console.log('📤 API: Uploading CSV data to FastAPI with JWT auth:', { endpoint, dataLength: csvData.length, userId });
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        diamonds: csvData
      }),
    });
  },
};
