
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { getAuthHeaders } from './auth';
import { getBackendAccessToken } from './secureConfig';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Enhanced backend connectivity test
async function testBackendConnectivity(): Promise<boolean> {
  try {
    console.log('🔍 API: Testing FastAPI backend connectivity to:', API_BASE_URL);
    console.log('🔍 API: Expected to connect to your real diamond database');
    
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      console.error('❌ API: No secure backend access token available for connectivity test');
      return false;
    }
    
    // Try the root endpoint first
    const testUrl = `${API_BASE_URL}/`;
    console.log('🔍 API: Testing root endpoint:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
    });
    
    console.log('🔍 API: Root endpoint response status:', response.status);
    
    if (response.ok || response.status === 404) {
      console.log('✅ API: FastAPI backend is reachable - your diamonds should be accessible');
      return true;
    }
    
    console.log('❌ API: FastAPI backend not reachable');
    console.log('❌ API: Status:', response.status, 'Check if your backend server is running');
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
    console.log('🚀 API: Making FastAPI request:', {
      url,
      method: options.method || 'GET',
      userId: getCurrentUserId(),
    });
    
    // Test connectivity first for non-GET requests
    if (options.method && options.method !== 'GET') {
      const isBackendReachable = await testBackendConnectivity();
      if (!isBackendReachable) {
        const errorMsg = 'FastAPI backend server is not reachable. Please check if the server is running at ' + API_BASE_URL;
        console.error('❌ API: Backend unreachable');
        throw new Error(errorMsg);
      }
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
    
    console.log('🚀 API: Request details:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
      headers: Object.keys(headers),
    });
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 API: Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response data received, count:', Array.isArray(data) ? data.length : 'not array');
    } else {
      const text = await response.text();
      console.log('📡 API: Text response:', text.substring(0, 200));
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `FastAPI Error ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ API: Request failed:', {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
      });
      
      throw new Error(errorMessage);
    }

    console.log('✅ API: Request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: Complete request failure:', {
      url,
      method: options.method || 'GET',
      error: errorMessage,
    });
    
    // Show specific toast messages for different error types
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Connection Error",
        description: `Cannot reach FastAPI server at ${API_BASE_URL}. Please check if the server is running.`,
        variant: "destructive",
      });
    } else if (errorMessage.includes('not reachable')) {
      toast({
        title: "🔌 FastAPI Server Offline",
        description: `The FastAPI backend at ${API_BASE_URL} is not responding.`,
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
  
  delete: <T>(endpoint: string) => {
    console.log('🗑️ API: DELETE request initiated for endpoint:', endpoint);
    return fetchApi<T>(endpoint, { method: "DELETE" });
  },
};
