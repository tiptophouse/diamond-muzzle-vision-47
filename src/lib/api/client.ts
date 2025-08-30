
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { getAuthHeaders } from './auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Fast connectivity cache to avoid repeated tests
let connectivityCache: { isConnected: boolean; lastChecked: number } | null = null;
const CONNECTIVITY_CACHE_DURATION = 30000; // 30 seconds

// Fast backend connectivity test with timeout - MUST use JWT
async function testBackendConnectivity(): Promise<boolean> {
  // Check cache first
  if (connectivityCache && (Date.now() - connectivityCache.lastChecked < CONNECTIVITY_CACHE_DURATION)) {
    console.log('🔍 API: Using cached connectivity status:', connectivityCache.isConnected);
    return connectivityCache.isConnected;
  }

  try {
    console.log('🔍 API: Testing FastAPI backend connectivity with JWT authentication');
    
    // CRITICAL: Always use JWT for backend communication
    const authHeaders = await getAuthHeaders();
    if (!authHeaders.Authorization) {
      console.error('❌ API: No JWT token available for connectivity test');
      connectivityCache = { isConnected: false, lastChecked: Date.now() };
      return false;
    }
    
    // Fast connectivity test with JWT authentication
    const testUrl = `${API_BASE_URL}/`;
    console.log('🔍 API: Testing root endpoint with JWT authentication:', testUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        ...authHeaders, // Always include JWT
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const isConnected = response.ok || response.status === 404;
    console.log('🔍 API: JWT authenticated connectivity test result:', isConnected);
    
    // Cache the result
    connectivityCache = { isConnected, lastChecked: Date.now() };
    
    if (isConnected) {
      console.log('✅ API: FastAPI backend is reachable with JWT authentication');
    } else {
      console.log('❌ API: FastAPI backend not reachable - status:', response.status);
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ API: JWT authenticated connectivity test failed:', error);
    connectivityCache = { isConnected: false, lastChecked: Date.now() };
    return false;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making authenticated FastAPI request:', url);
    console.log('🚀 API: Method:', options.method || 'GET');
    console.log('🚀 API: Current user ID:', getCurrentUserId());
    
    // CRITICAL: Test JWT authenticated connectivity first
    const isBackendReachable = await testBackendConnectivity();
    if (!isBackendReachable) {
      const errorMsg = 'FastAPI backend server is not reachable with JWT authentication. Please check server and authentication.';
      console.error('❌ API: JWT authenticated backend unreachable');
      throw new Error(errorMsg);
    }
    
    // CRITICAL: Always get and use JWT authentication headers
    const authHeaders = await getAuthHeaders();
    if (!authHeaders.Authorization) {
      console.error('❌ API: No JWT Bearer token available for request');
      throw new Error('Authentication required: No JWT token available');
    }
    
    console.log('🔐 API: Using JWT Bearer authentication for request');
    
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      ...authHeaders, // CRITICAL: Always include JWT Bearer token
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit', // Don't use cookies, only JWT
    };
    
    console.log('🚀 API: Request with JWT authentication:', {
      url,
      method: fetchOptions.method || 'GET',
      hasJWT: !!headers.Authorization,
      authType: headers.Authorization ? 'Bearer JWT' : 'None',
    });
    
    // Add timeout to main request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('📡 API: JWT authenticated response status:', response.status);

    // Handle authentication errors specifically
    if (response.status === 401 || response.status === 403) {
      console.error('❌ API: Authentication failed - JWT token invalid or expired');
      throw new Error('Authentication failed: JWT token invalid or expired');
    }

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JWT authenticated JSON response received');
    } else {
      const text = await response.text();
      console.log('📡 API: JWT authenticated non-JSON response:', text.substring(0, 200));
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `FastAPI Error ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ API: JWT authenticated request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ API: JWT authenticated request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: JWT authenticated request error:', errorMessage);
    
    // Show specific authentication error messages
    if (errorMessage.includes('Authentication failed') || errorMessage.includes('JWT token')) {
      toast({
        title: "🔐 Authentication Error",
        description: "JWT token invalid or expired. Please refresh the app.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Connection Error",
        description: "Cannot reach FastAPI server. Please check your connection.",
        variant: "destructive",
      });
    }
    
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) => {
    console.log('📤 API: POST request with JWT authentication');
    console.log('📤 API: Endpoint:', endpoint);
    console.log('📤 API: Body data for JWT authenticated request');
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },
  
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
    console.log('📤 API: Uploading CSV with JWT authentication:', { endpoint, dataLength: csvData.length, userId });
    
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
