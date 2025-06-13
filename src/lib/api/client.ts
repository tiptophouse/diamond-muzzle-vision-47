
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId, BACKEND_ACCESS_TOKEN } from './config';
import { getAuthHeaders } from './auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Enhanced backend connectivity test
async function testBackendConnectivity(): Promise<boolean> {
  try {
    console.log('🔍 API: Testing FastAPI backend connectivity to:', API_BASE_URL);
    
    // Try the root endpoint first
    const testUrl = `${API_BASE_URL}/`;
    console.log('🔍 API: Testing root endpoint:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
      },
    });
    
    console.log('🔍 API: Root endpoint response status:', response.status);
    
    if (response.ok || response.status === 404) {
      console.log('✅ API: FastAPI backend is reachable');
      return true;
    }
    
    console.log('❌ API: FastAPI backend not reachable - status:', response.status);
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
    
    // Test connectivity first
    const isBackendReachable = await testBackendConnectivity();
    if (!isBackendReachable) {
      throw new Error('FastAPI backend server is not reachable. Please check if the server is running at ' + API_BASE_URL);
    }
    
    const authHeaders = await getAuthHeaders();
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      "Authorization": `Bearer ${BACKEND_ACCESS_TOKEN}`,
      ...authHeaders,
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };
    
    console.log('🚀 API: Fetch options:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
      headers: Object.keys(headers),
    });
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 API: FastAPI Response status:', response.status);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received from FastAPI');
      console.log('📡 API: Data type:', typeof data, 'is array:', Array.isArray(data));
      if (Array.isArray(data)) {
        console.log('📡 API: Array length:', data.length, 'sample:', data.slice(0, 2));
      } else {
        console.log('📡 API: Response data structure:', data);
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
      throw new Error(errorMessage);
    }

    console.log('✅ API: FastAPI request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: FastAPI request error:', errorMessage);
    console.error('❌ API: Error details:', error);
    
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
        description: `The FastAPI backend at ${API_BASE_URL} is not responding. Please start the server.`,
        variant: "destructive",
      });
    } else if (errorMessage.includes('CORS')) {
      toast({
        title: "🚫 CORS Issue",
        description: "FastAPI server CORS configuration issue. Please check server settings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "❌ FastAPI Error",
        description: `FastAPI request failed: ${errorMessage}`,
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
