import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { getAuthHeaders } from './auth';
import { getBackendAccessToken } from './secureConfig';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Fast connectivity cache to avoid repeated tests
let connectivityCache: { isConnected: boolean; lastChecked: number } | null = null;
const CONNECTIVITY_CACHE_DURATION = 30000; // 30 seconds

// Fast backend connectivity test with timeout
async function testBackendConnectivity(): Promise<boolean> {
  // Check cache first
  if (connectivityCache && (Date.now() - connectivityCache.lastChecked < CONNECTIVITY_CACHE_DURATION)) {
    console.log('🔍 API: Using cached connectivity status:', connectivityCache.isConnected);
    return connectivityCache.isConnected;
  }

  try {
    console.log('🔍 API: Testing FastAPI backend connectivity to:', API_BASE_URL);
    
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      console.error('❌ API: No secure backend access token available for connectivity test');
      connectivityCache = { isConnected: false, lastChecked: Date.now() };
      return false;
    }
    
    // Fast connectivity test with 2 second timeout
    const testUrl = `${API_BASE_URL}/`;
    console.log('🔍 API: Testing root endpoint with 2s timeout:', testUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const isConnected = response.ok || response.status === 404;
    console.log('🔍 API: Fast connectivity test result:', isConnected);
    
    // Cache the result
    connectivityCache = { isConnected, lastChecked: Date.now() };
    
    if (isConnected) {
      console.log('✅ API: FastAPI backend is reachable - your diamonds should be accessible');
    } else {
      console.log('❌ API: FastAPI backend not reachable - status:', response.status);
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ API: Fast connectivity test failed:', error);
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
    console.log('🚀 API: Making FastAPI request:', url);
    console.log('🚀 API: Method:', options.method || 'GET');
    
    const currentUserId = getCurrentUserId();
    console.log('🚀 API: Current user ID:', currentUserId, 'type:', typeof currentUserId);
    
    // Validate user permissions for user-specific endpoints
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const requestedUserId = urlParams.get('user_id');
    
    if (requestedUserId && currentUserId) {
      const requestedUserIdNum = parseInt(requestedUserId);
      const ADMIN_TELEGRAM_ID = 2138564172;
      
      // Allow admin to access any user's data, but restrict regular users to their own data
      if (currentUserId !== ADMIN_TELEGRAM_ID && currentUserId !== requestedUserIdNum) {
        console.error('❌ API: Access denied - User', currentUserId, 'cannot access data for user', requestedUserIdNum);
        throw new Error('Access denied: You can only access your own data');
      }
      
      console.log('✅ API: Permission validated - User', currentUserId, 'accessing data for user', requestedUserIdNum);
    }
    
    if (options.method === 'POST') {
      console.log('📤 API: This is a POST request (CREATE diamond)');
      console.log('📤 API: Should create diamond in FastAPI backend');
    } else {
      console.log('🚀 API: This should return your diamonds, not mock data');
    }
    
    // Test connectivity first
    const isBackendReachable = await testBackendConnectivity();
    if (!isBackendReachable) {
      const errorMsg = 'FastAPI backend server is not reachable. Please check if the server is running at ' + API_BASE_URL;
      console.error('❌ API: Backend unreachable - this forces fallback to 5 mock diamonds');
      throw new Error(errorMsg);
    }
    
    const authHeaders = await getAuthHeaders();
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      ...authHeaders,
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };
    
    console.log('🚀 API: Fetch options for real data:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
      headers: Object.keys(headers),
      currentUserId,
      requestedUserId
    });
    
    // Add timeout to main request too
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for main request
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('📡 API: FastAPI Response status:', response.status);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received from FastAPI');
      console.log('📡 API: Data type:', typeof data, 'is array:', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('📡 API: SUCCESS! Array length:', data.length, '(expecting ~500 diamonds)');
        if (data.length < 100) {
          console.warn('⚠️ API: Expected 500+ diamonds but got', data.length, '- check your backend database');
        }
        console.log('📡 API: Sample diamond:', data.slice(0, 1));
      } else {
        console.log('📡 API: Response data structure:', Object.keys(data || {}));
        if (data && typeof data === 'object') {
          const possibleArrays = Object.keys(data).filter(key => Array.isArray(data[key]));
          if (possibleArrays.length > 0) {
            console.log('📡 API: Found arrays in properties:', possibleArrays);
            possibleArrays.forEach(key => {
              console.log(`📡 API: ${key} has ${data[key].length} items`);
            });
          }
        }
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
      
      console.error('❌ API: FastAPI request failed - this causes fallback to mock data:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ API: FastAPI request successful - should have your real diamond data now');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: FastAPI request error - this is why you see 5 mock diamonds instead of 500 real ones:', errorMessage);
    console.error('❌ API: Error details:', error);
    
    // Show specific toast messages for different error types
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Connection Error",
        description: `Cannot reach FastAPI server at ${API_BASE_URL}. Your 500 diamonds are not accessible. Please check if the server is running.`,
        variant: "destructive",
      });
    } else if (errorMessage.includes('not reachable')) {
      toast({
        title: "🔌 FastAPI Server Offline",
        description: `The FastAPI backend at ${API_BASE_URL} is not responding. This is why you see 5 mock diamonds instead of your 500 real diamonds.`,
        variant: "destructive",
      });
    } else if (errorMessage.includes('CORS')) {
      toast({
        title: "🚫 CORS Issue",
        description: "FastAPI server CORS configuration issue. Please check server settings to access your real diamond data.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "❌ FastAPI Error",
        description: `FastAPI request failed: ${errorMessage}. Falling back to mock data (5 diamonds).`,
        variant: "destructive",
      });
    }
    
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) => {
    console.log('📤 API: POST request initiated');
    console.log('📤 API: Endpoint:', endpoint);
    console.log('📤 API: Body data:', JSON.stringify(body, null, 2));
    console.log('📤 API: This should be a CREATE diamond request to FastAPI');
    
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
    console.log('📤 API: Uploading CSV data to FastAPI:', { endpoint, dataLength: csvData.length, userId });
    
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
