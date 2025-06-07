
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
    console.log('🚀 API: Making request to:', url);
    console.log('🚀 API: Current user ID:', getCurrentUserId(), 'type:', typeof getCurrentUserId());
    
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...getAuthHeaders(),
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
    };
    
    console.log('🚀 API: Fetch options:', fetchOptions);
    
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
      console.log('📡 API: Non-JSON response:', text);
      data = text;
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data 
        ? (data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`)
        : `HTTP ${response.status}: ${response.statusText}`;
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
        description: "Cannot reach server. Check your internet connection.",
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
