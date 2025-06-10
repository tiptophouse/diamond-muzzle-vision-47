
import { toast } from "@/components/ui/use-toast";
import { FASTAPI_BASE_URL, getFastApiUrl } from './config';

interface FastApiResponse<T> {
  data?: T;
  error?: string;
}

interface FastApiDeleteResponse {
  success: boolean;
  message: string;
}

export async function fetchFastApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<FastApiResponse<T>> {
  const url = getFastApiUrl(endpoint);
  
  try {
    console.log('🚀 FastAPI: Making request to:', url);
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };
    
    console.log('🚀 FastAPI: Fetch options:', {
      url,
      method: fetchOptions.method || 'GET',
      hasBody: !!fetchOptions.body,
    });
    
    const response = await fetch(url, fetchOptions);

    console.log('📡 FastAPI: Response status:', response.status);

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 FastAPI: JSON response received:', data);
    } else {
      const text = await response.text();
      console.log('📡 FastAPI: Non-JSON response:', text);
      data = text;
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data && data.detail) {
        errorMessage = data.detail;
      } else if (typeof data === 'string') {
        errorMessage = data || errorMessage;
      }
      
      console.error('❌ FastAPI: Request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ FastAPI: Request successful');
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ FastAPI: Request error:', errorMessage);
    
    // Show toast for critical errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Network Error",
        description: "Cannot reach the FastAPI server. Please check your connection and try again.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('CORS')) {
      toast({
        title: "🚫 CORS Error",
        description: "Server configuration issue. Please ensure CORS is properly configured on your FastAPI backend.",
        variant: "destructive",
      });
    }
    
    return { error: errorMessage };
  }
}

export const fastApi = {
  get: <T>(endpoint: string) => fetchFastApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) =>
    fetchFastApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: Record<string, any>) =>
    fetchFastApi<T>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchFastApi<T>(endpoint, { method: "DELETE" }),
};

// Specific function for deleting diamonds via FastAPI
export async function deleteDiamondViaFastApi(diamondId: number): Promise<FastApiDeleteResponse> {
  console.log('🗑️ FastAPI: Deleting diamond with ID:', diamondId);
  
  const response = await fastApi.delete<FastApiDeleteResponse>(`/diamonds/${diamondId}`);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data as FastApiDeleteResponse;
}
