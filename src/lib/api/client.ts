
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId, BACKEND_ACCESS_TOKEN } from './config';
import { getAuthHeaders } from './auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Test backend connectivity
async function testBackendConnectivity(): Promise<boolean> {
  try {
    console.log('🔍 API: Testing backend connectivity to:', API_BASE_URL);
    
    // Try different test endpoints
    const testUrls = [
      `${API_BASE_URL}/`,
      `${API_BASE_URL}/health`,
      `${API_BASE_URL}/docs`,
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
          },
        });
        
        if (response.ok || response.status === 404) {
          console.log('✅ API: Backend is reachable at:', url);
          return true;
        }
      } catch (error) {
        console.log('❌ API: Failed to reach:', url, error instanceof Error ? error.message : String(error));
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ API: Backend connectivity test failed:', error);
    return false;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making request to:', url);
    console.log('🚀 API: Current user ID:', getCurrentUserId(), 'type:', typeof getCurrentUserId());
    
    // Test connectivity first if this is the first request
    const isBackendReachable = await testBackendConnectivity();
    if (!isBackendReachable) {
      throw new Error('Backend server is not reachable. Please check if the server is running.');
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
      credentials: 'omit', // Don't send cookies
    };
    
    console.log('🚀 API: Fetch options:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
    });
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 API: Response status:', response.status);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received, data type:', typeof data, 'length:', Array.isArray(data) ? data.length : 'not array');
      if (Array.isArray(data)) {
        console.log('📡 API: Sample data (first 2 items):', data.slice(0, 2));
      } else {
        console.log('📡 API: Response data:', data);
      }
    } else {
      const text = await response.text();
      console.log('📡 API: Non-JSON response:', text.substring(0, 200));
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ API: Request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ API: Request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: Request error:', errorMessage);
    console.error('❌ API: Error details:', error);
    
    // Show toast for critical errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Network Error",
        description: "Cannot reach the diamond inventory server. Please check your connection and try again.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('not reachable')) {
      toast({
        title: "🔌 Server Unavailable",
        description: "The backend server appears to be offline. Please contact support.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('CORS')) {
      toast({
        title: "🚫 Access Blocked",
        description: "Server configuration issue. Please contact support about CORS settings.",
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
