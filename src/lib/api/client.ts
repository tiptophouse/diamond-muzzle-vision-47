import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { getAuthHeaders } from './auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}


export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making FastAPI request:', url);
    console.log('🚀 API: Method:', options.method || 'GET');
    console.log('🚀 API: Current user ID:', getCurrentUserId(), 'type:', typeof getCurrentUserId());
    
    const authHeaders = await getAuthHeaders();
    if (!authHeaders.Authorization) {
      const errorMsg = 'No JWT token available - user must be authenticated first';
      console.error('❌ API: Missing JWT token');
      throw new Error(errorMsg);
    }
    
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
    
    console.log('🚀 API: Request with JWT authentication:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
    });
    
    // Add timeout to main request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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
    console.error('❌ API: FastAPI request error:', errorMessage);
    console.error('❌ API: Error details:', error);
    
    // Show specific toast messages for different error types
    if (errorMessage.includes('No JWT token')) {
      toast({
        title: "🔐 Authentication Required",
        description: "Please authenticate with Telegram to access your diamonds.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Connection Error",
        description: `Cannot reach FastAPI server. Please check your connection.`,
        variant: "destructive",
      });
    } else if (errorMessage.includes('CORS')) {
      toast({
        title: "🚫 CORS Issue",
        description: "Server configuration issue. Please try again later.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      toast({
        title: "🔐 Authentication Failed",
        description: "Your session has expired. Please refresh the app.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "❌ API Error",
        description: `Request failed: ${errorMessage}`,
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
