
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId, BACKEND_ACCESS_TOKEN, getFallbackApiUrl, isDevelopment } from './config';
import { getAuthHeaders } from './auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let hasTriedFallback = false;

// Enhanced backend connectivity test with more detailed error reporting
async function testBackendConnectivity(url: string = API_BASE_URL): Promise<{ isReachable: boolean; error?: string }> {
  try {
    console.log('🔍 API: Testing backend connectivity to:', url);
    
    const testUrls = [
      `${url}/`,
      `${url}/health`,
      `${url}/docs`,
    ];
    
    for (const testUrl of testUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(testUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 404) {
          console.log('✅ API: Backend is reachable at:', testUrl);
          return { isReachable: true };
        } else {
          console.log(`⚠️ API: Backend responded with status ${response.status} at:`, testUrl);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log('❌ API: Failed to reach:', testUrl, errorMsg);
        if (error instanceof Error && error.name === 'AbortError') {
          return { isReachable: false, error: 'Connection timeout' };
        }
      }
    }
    
    return { isReachable: false, error: 'All endpoints unreachable' };
  } catch (error) {
    console.error('❌ API: Backend connectivity test failed:', error);
    return { isReachable: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let baseUrl = API_BASE_URL;
  let connectionError = '';
  
  // Enhanced connection testing for development mode
  if (isDevelopment() && !hasTriedFallback) {
    const localTest = await testBackendConnectivity(baseUrl);
    if (!localTest.isReachable) {
      console.log('🔄 API: Local backend not reachable, testing fallback URL');
      connectionError = `Local backend error: ${localTest.error}`;
      
      const fallbackUrl = getFallbackApiUrl();
      const fallbackTest = await testBackendConnectivity(fallbackUrl);
      
      if (fallbackTest.isReachable) {
        console.log('✅ API: Fallback URL is reachable, switching to:', fallbackUrl);
        baseUrl = fallbackUrl;
        hasTriedFallback = true;
      } else {
        console.error('❌ API: Both local and fallback backends are unreachable');
        connectionError += ` | Fallback error: ${fallbackTest.error}`;
        
        // Show detailed error to user
        toast({
          title: "🚨 Backend Connection Failed",
          description: `Cannot reach any backend servers. Local: ${localTest.error}, External: ${fallbackTest.error}`,
          variant: "destructive",
        });
        
        return { 
          error: `No backend available. ${connectionError}` 
        };
      }
    }
  }
  
  const url = `${baseUrl}${endpoint}`;
  
  try {
    console.log('🚀 API: Making request to:', url);
    console.log('🚀 API: Current user ID:', getCurrentUserId(), 'type:', typeof getCurrentUserId());
    
    const authHeaders = await getAuthHeaders();
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": window.location.origin,
      ...authHeaders,
      ...options.headers as Record<string, string>,
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
    };
    
    console.log('🚀 API: Fetch options:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
    });
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

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
      
      // Show specific error messages for different status codes
      if (response.status === 404) {
        toast({
          title: "🔍 Endpoint Not Found",
          description: `The API endpoint ${endpoint} was not found on the server.`,
          variant: "destructive",
        });
      } else if (response.status >= 500) {
        toast({
          title: "🚨 Server Error",
          description: `The server encountered an error (${response.status}). Please try again.`,
          variant: "destructive",
        });
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ API: Request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: Request error:', errorMessage);
    console.error('❌ API: Error details:', error);
    
    // Enhanced error handling with specific user guidance
    if (error instanceof Error && error.name === 'AbortError') {
      toast({
        title: "⏱️ Request Timeout",
        description: "The server is taking too long to respond. Check your connection or try again.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      // Try fallback URL if we haven't already and this is a connection error
      if (!hasTriedFallback && isDevelopment()) {
        console.log('🔄 API: Trying fallback URL due to connection error');
        hasTriedFallback = true;
        return fetchApi(endpoint, options); // Retry with fallback
      }
      
      toast({
        title: "🌐 Network Connection Error",
        description: "Cannot reach the diamond inventory server. Please check: 1) Your internet connection, 2) That the backend server is running, 3) Firewall settings.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('CORS')) {
      toast({
        title: "🚫 Access Blocked",
        description: "Server configuration issue. The API server needs CORS settings updated.",
        variant: "destructive",
      });
    }
    
    return { error: errorMessage };
  }
}

// Reset fallback flag function for testing
export function resetFallbackFlag() {
  hasTriedFallback = false;
  console.log('🔄 API: Fallback flag reset, will retry local backend first');
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
    console.log('📤 API: Uploading CSV data to backend:', { endpoint, dataLength: csvData.length, userId });
    
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
