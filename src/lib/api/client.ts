
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from './config';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface FastApiProxyResponse {
  success: boolean;
  status: number;
  data: any;
  error: string | null;
}

// Secure API client using Supabase Edge Function as proxy
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  
  try {
    console.log('🔒 Secure API: Making request to:', endpoint);
    console.log('🔒 Secure API: Current user ID:', getCurrentUserId());
    
    const userId = getCurrentUserId();
    
    // Call the secure Supabase Edge Function instead of direct FastAPI
    const { data: proxyResponse, error: supabaseError } = await supabase.functions.invoke<FastApiProxyResponse>('fastapi-proxy', {
      body: {
        endpoint,
        method: options.method || 'GET',
        body: options.body ? JSON.parse(options.body as string) : undefined,
        userId: userId
      }
    });

    if (supabaseError) {
      console.error('🔒 Secure API: Supabase error:', supabaseError);
      throw new Error(`Supabase function error: ${supabaseError.message}`);
    }

    if (!proxyResponse) {
      throw new Error('No response from secure proxy');
    }

    console.log('🔒 Secure API: Proxy response:', proxyResponse);

    if (!proxyResponse.success) {
      const errorMessage = proxyResponse.error || `HTTP ${proxyResponse.status}`;
      console.error('🔒 Secure API: FastAPI error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ Secure API: Request successful');
    return { data: proxyResponse.data as T };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ Secure API: Request error:', errorMessage);
    
    // Show toast for critical errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      toast({
        title: "🌐 Network Error",
        description: "Cannot reach the diamond inventory server. Please check your connection and try again.",
        variant: "destructive",
      });
    } else if (errorMessage.includes('Backend configuration error')) {
      toast({
        title: "🔌 Server Configuration Error",
        description: "Backend server configuration issue. Please contact support.",
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
    console.log('📤 Secure API: Uploading CSV data:', { endpoint, dataLength: csvData.length, userId });
    
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
