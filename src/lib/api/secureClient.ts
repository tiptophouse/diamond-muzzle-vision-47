
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from './config';
import { getJWTAuthHeaders, getCurrentJWTUserId, isJWTValid } from './jwtAuth';

interface SecureApiResponse<T> {
  data?: T;
  error?: string;
}

// Secure API client that enforces JWT authentication and user isolation
export async function secureApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<SecureApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Verify JWT is valid
    if (!isJWTValid()) {
      const errorMsg = 'Authentication required - please sign in again';
      console.error('❌ Secure API: Invalid JWT token');
      toast({
        title: "Authentication Required",
        description: "Please sign in again to access your data",
        variant: "destructive",
      });
      return { error: errorMsg };
    }

    const jwtUserId = getCurrentJWTUserId();
    if (!jwtUserId) {
      const errorMsg = 'User ID not available in JWT token';
      console.error('❌ Secure API: No user ID in JWT');
      return { error: errorMsg };
    }

    console.log('🔒 Secure API request:', {
      method: options.method || 'GET',
      endpoint,
      userId: jwtUserId,
      url
    });

    // Get JWT auth headers
    const authHeaders = getJWTAuthHeaders();
    
    const headers: Record<string, string> = {
      ...authHeaders,
      "Origin": window.location.origin,
      ...options.headers as Record<string, string>,
    };

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };

    console.log('🔒 Making authenticated request with JWT');
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 Secure API Response:', {
      status: response.status,
      ok: response.ok,
      endpoint
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      
      if (Array.isArray(data)) {
        console.log('📡 Received array data - length:', data.length);
      } else {
        console.log('📡 Received object data:', Object.keys(data || {}));
      }
    } else {
      const text = await response.text();
      console.log('📡 Non-JSON response:', text.substring(0, 200));
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        errorMessage = data.detail || data.message || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ Secure API request failed:', errorMessage);
      
      // Show user-friendly error messages
      if (response.status === 401) {
        toast({
          title: "Authentication Failed",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return { error: errorMessage };
    }

    console.log('✅ Secure API request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error occurred";
    console.error('❌ Secure API request error:', errorMessage);
    
    toast({
      title: "Connection Error",
      description: `Cannot connect to server: ${errorMessage}`,
      variant: "destructive",
    });
    
    return { error: errorMessage };
  }
}

// Secure API methods with user isolation
export const secureApi = {
  get: <T>(endpoint: string) => {
    const userId = getCurrentJWTUserId();
    const endpointWithUserId = endpoint.includes('user_id=') 
      ? endpoint 
      : `${endpoint}${endpoint.includes('?') ? '&' : '?'}user_id=${userId}`;
    
    return secureApiRequest<T>(endpointWithUserId, { method: "GET" });
  },
  
  post: <T>(endpoint: string, body: Record<string, any>) => {
    const userId = getCurrentJWTUserId();
    const endpointWithUserId = endpoint.includes('user_id=') 
      ? endpoint 
      : `${endpoint}${endpoint.includes('?') ? '&' : '?'}user_id=${userId}`;
    
    console.log('📤 Secure POST request:', {
      endpoint: endpointWithUserId,
      userId,
      bodyKeys: Object.keys(body)
    });
    
    return secureApiRequest<T>(endpointWithUserId, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  
  put: <T>(endpoint: string, body: Record<string, any>) => {
    const userId = getCurrentJWTUserId();
    const endpointWithUserId = endpoint.includes('user_id=') 
      ? endpoint 
      : `${endpoint}${endpoint.includes('?') ? '&' : '?'}user_id=${userId}`;
    
    return secureApiRequest<T>(endpointWithUserId, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  
  delete: <T>(endpoint: string) => {
    const userId = getCurrentJWTUserId();
    const endpointWithUserId = endpoint.includes('user_id=') 
      ? endpoint 
      : `${endpoint}${endpoint.includes('?') ? '&' : '?'}user_id=${userId}`;
    
    console.log('🗑️ Secure DELETE request:', {
      endpoint: endpointWithUserId,
      userId
    });
    
    return secureApiRequest<T>(endpointWithUserId, { method: "DELETE" });
  }
};
