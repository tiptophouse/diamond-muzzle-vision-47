
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { telegramAuth } from '@/lib/telegram/SecureTelegramAuth';
import { getBackendAccessToken } from './secureConfig';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get authentication headers with JWT token
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Client-Timestamp": Date.now().toString(),
  };
  
  // Add JWT token from Telegram auth if available
  const jwtToken = telegramAuth.getJwtToken();
  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  } else {
    // Fallback to backend access token
    const backendToken = await getBackendAccessToken();
    if (backendToken) {
      headers["X-Backend-Auth"] = `Bearer ${backendToken}`;
    }
  }
  
  return headers;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API Request:', options.method || 'GET', url);
    
    const authHeaders = await getAuthHeaders();
    const headers = {
      ...authHeaders,
      ...options.headers as Record<string, string>,
    };
    
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit',
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('✅ API Success:', url);
    return { data: data as T };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown API error";
    console.error('❌ API Error:', url, errorMessage);
    
    toast({
      title: "API Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
};
