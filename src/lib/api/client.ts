import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { getAuthHeaders } from './auth';
import { getBackendAccessToken } from './secureConfig';
import { secureLog, sanitizeUrl } from '@/utils/secureLogging';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Enhanced backend connectivity test
async function testBackendConnectivity(): Promise<boolean> {
  try {
    secureLog.debug('API: Testing FastAPI backend connectivity', { url: sanitizeUrl(API_BASE_URL) });
    
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      secureLog.error('API: No secure backend access token available for connectivity test');
      return false;
    }
    
    // Try the root endpoint first
    const testUrl = `${API_BASE_URL}/`;
    secureLog.debug('API: Testing root endpoint', { url: sanitizeUrl(testUrl) });
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
      },
    });
    
    secureLog.debug('API: Root endpoint response', { status: response.status });
    
    if (response.ok || response.status === 404) {
      secureLog.info('API: FastAPI backend is reachable');
      return true;
    }
    
    secureLog.warn('API: FastAPI backend not reachable', { status: response.status });
    return false;
  } catch (error) {
    secureLog.error('API: FastAPI backend connectivity test failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    secureLog.debug('API: Making FastAPI request', { 
      url: sanitizeUrl(url), 
      method: options.method || 'GET',
      hasUserId: !!getCurrentUserId()
    });
    
    // Test connectivity first
    const isBackendReachable = await testBackendConnectivity();
    if (!isBackendReachable) {
      const errorMsg = 'FastAPI backend server is not reachable';
      secureLog.error('API: Backend unreachable', { url: sanitizeUrl(API_BASE_URL) });
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
    
    secureLog.debug('API: Request details', {
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
      headerCount: Object.keys(headers).length,
    });
    
    const response = await fetch(url, fetchOptions);

    secureLog.debug('API: Response received', { 
      status: response.status,
      contentType: response.headers.get('content-type')
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      secureLog.debug('API: JSON response received', { 
        dataType: typeof data, 
        isArray: Array.isArray(data),
        arrayLength: Array.isArray(data) ? data.length : undefined
      });
      
      if (Array.isArray(data) && data.length < 100) {
        secureLog.warn('API: Unexpected array length', { length: data.length });
      }
    } else {
      const text = await response.text();
      secureLog.debug('API: Non-JSON response received', { 
        length: text.length,
        preview: text.substring(0, 100)
      });
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `FastAPI Error ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      secureLog.error('API: FastAPI request failed', { 
        status: response.status,
        message: errorMessage 
      });
      throw new Error(errorMessage);
    }

    secureLog.info('API: FastAPI request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    secureLog.error('API: FastAPI request error', { 
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
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
    secureLog.debug('API: POST request initiated', { 
      endpoint: sanitizeUrl(endpoint),
      bodyKeys: Object.keys(body || {})
    });
    
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
    secureLog.debug('API: Uploading CSV data', { 
      endpoint: sanitizeUrl(endpoint), 
      dataLength: csvData.length,
      hasUserId: !!userId
    });
    
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
