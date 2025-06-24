
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId, BACKEND_ACCESS_TOKEN } from './config';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Enhanced backend connectivity test
async function testBackendConnectivity(): Promise<boolean> {
  try {
    console.log('🔍 API: Testing FastAPI backend connectivity to:', API_BASE_URL);
    console.log('🔍 API: Using access token:', BACKEND_ACCESS_TOKEN ? 'Present' : 'Missing');
    
    if (!BACKEND_ACCESS_TOKEN) {
      console.error('❌ API: No backend access token available for connectivity test');
      return false;
    }
    
    // Try a simple alive endpoint first
    const testUrl = `${API_BASE_URL}/api/v1/alive`;
    console.log('🔍 API: Testing alive endpoint:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
      },
    });
    
    console.log('🔍 API: Alive endpoint response status:', response.status);
    
    if (response.ok) {
      console.log('✅ API: FastAPI backend is reachable');
      return true;
    }
    
    console.log('❌ API: FastAPI backend not reachable - Status:', response.status);
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
    console.log('🚀 API: Making FastAPI request to:', url);
    console.log('🚀 API: Current user ID:', getCurrentUserId(), 'type:', typeof getCurrentUserId());
    console.log('🚀 API: Using backend token:', BACKEND_ACCESS_TOKEN ? 'Present' : 'Missing');
    console.log('🚀 API: Request method:', options.method || 'GET');
    
    // Test connectivity first for GET requests
    if (!options.method || options.method === 'GET') {
      const isBackendReachable = await testBackendConnectivity();
      if (!isBackendReachable) {
        const errorMsg = 'FastAPI backend server is not reachable. Please check server status.';
        console.error('❌ API: Backend unreachable');
        throw new Error(errorMsg);
      }
    }
    
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      ...options.headers as Record<string, string>,
    };

    // Add Bearer token for authenticated endpoints
    if (BACKEND_ACCESS_TOKEN) {
      headers["Authorization"] = `Bearer ${BACKEND_ACCESS_TOKEN}`;
    }
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };
    
    console.log('🚀 API: Request headers:', Object.keys(headers));
    if (fetchOptions.body) {
      console.log('🚀 API: Request body:', fetchOptions.body);
    }
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 API: Response status:', response.status);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received');
      console.log('📡 API: Response data type:', typeof data);
      if (Array.isArray(data)) {
        console.log('📡 API: Array response length:', data.length);
        if (data.length > 0) {
          console.log('📡 API: Sample item:', data[0]);
        }
      } else if (data && typeof data === 'object') {
        console.log('📡 API: Object response keys:', Object.keys(data));
      }
    } else {
      const text = await response.text();
      console.log('📡 API: Non-JSON response:', text.substring(0, 200));
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `FastAPI Error ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ API: Request failed:', errorMessage);
      
      toast({
        title: "❌ API Error",
        description: `Request failed: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    }

    console.log('✅ API: Request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: Request error:', errorMessage);
    
    // Show specific toast messages for different error types
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Connection Error",
        description: `Cannot reach FastAPI server. Please check your internet connection.`,
        variant: "destructive",
      });
    } else if (errorMessage.includes('not reachable')) {
      toast({
        title: "🔌 FastAPI Server Offline",
        description: `The FastAPI backend is not responding. Please contact support.`,
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
