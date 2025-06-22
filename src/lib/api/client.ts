import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { getAuthHeaders } from './auth';
import { getBackendAccessToken } from './secureConfig';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Enhanced backend connectivity test with detailed diagnostics
async function testBackendConnectivity(): Promise<{ connected: boolean; details: string[] }> {
  const details: string[] = [];
  
  try {
    console.log('🔍 API: Testing FastAPI backend connectivity to:', API_BASE_URL);
    details.push(`Testing connectivity to: ${API_BASE_URL}`);
    
    const backendToken = await getBackendAccessToken();
    if (!backendToken) {
      const error = 'No secure backend access token available';
      console.error('❌ API:', error);
      details.push(`❌ ${error}`);
      return { connected: false, details };
    }
    details.push('✅ Backend access token available');
    
    // Try the root endpoint first
    const testUrl = `${API_BASE_URL}/`;
    details.push(`Testing root endpoint: ${testUrl}`);
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
    details.push(`Root endpoint status: ${response.status}`);
    
    if (response.ok || response.status === 404) {
      console.log('✅ API: FastAPI backend is reachable - your diamonds should be accessible');
      details.push('✅ FastAPI backend is reachable');
      return { connected: true, details };
    }
    
    console.log('❌ API: FastAPI backend not reachable - this causes fallback to mock data');
    details.push(`❌ Backend not reachable (status: ${response.status})`);
    details.push('This is why you see mock data instead of your real diamonds');
    return { connected: false, details };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ API: FastAPI backend connectivity test failed:', errorMsg);
    details.push(`❌ Connection failed: ${errorMsg}`);
    details.push('This causes fallback to mock data instead of real diamonds');
    return { connected: false, details };
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making FastAPI request to fetch real diamonds:', url);
    console.log('🚀 API: Current user ID:', getCurrentUserId(), 'type:', typeof getCurrentUserId());
    
    // Test connectivity first with detailed diagnostics
    const { connected, details } = await testBackendConnectivity();
    if (!connected) {
      const errorMsg = 'FastAPI backend server is not reachable';
      console.error('❌ API: Backend unreachable - this forces fallback to mock data');
      console.error('❌ API: Diagnostics:', details);
      
      // Show detailed error toast
      toast({
        title: "🔌 FastAPI Server Offline",
        description: details.slice(-1)[0] || errorMsg,
        variant: "destructive",
      });
      
      throw new Error(`${errorMsg}. Details: ${details.join(', ')}`);
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
    
    console.log('🚀 API: Enhanced fetch options for real data:', {
      url,
      method: fetchOptions.method || 'GET',
      hasAuth: !!headers.Authorization,
      hasBody: !!fetchOptions.body,
      userId: getCurrentUserId()
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
        console.log('📡 API: SUCCESS! Array length:', data.length, '(your real diamonds!)');
        if (data.length >= 100) {
          console.log('🎉 API: Large inventory detected - this is your real data, not mock!');
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
      
      console.error('❌ API: FastAPI request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ API: FastAPI request successful - real diamond data loaded');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: FastAPI request error:', errorMessage);
    console.error('❌ API: Error details:', error);
    
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
