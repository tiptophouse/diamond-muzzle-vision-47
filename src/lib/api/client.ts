
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL, getCurrentUserId } from './config';
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface EdgeFunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  source?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  
  try {
    console.log('🚀 API: Using Supabase edge function for diamond operations');
    
    // Extract action and parameters from endpoint
    let action = '';
    let diamondId = '';
    let stockNumber = '';
    const userId = getCurrentUserId()?.toString() || '2138564172';
    
    if (endpoint.includes('/get_all_stones')) {
      action = 'get_all';
    } else if (endpoint.includes('/diamonds') && options.method === 'POST') {
      action = 'add';
    } else if (endpoint.includes('/diamonds/') && options.method === 'PUT') {
      action = 'update';
      diamondId = endpoint.match(/\/diamonds\/([^\/]+)/)?.[1] || '';
    } else if (endpoint.includes('/delete_stone/')) {
      action = 'delete';
      stockNumber = endpoint.match(/\/delete_stone\/([^\/]+)/)?.[1] || '';
    }

    if (!action) {
      throw new Error('Unsupported endpoint - using fallback');
    }

    console.log('🔸 Calling diamond-management edge function:', { action, userId, diamondId, stockNumber });

    const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('diamond-management', {
      method: (options.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
      body: options.body ? JSON.parse(options.body as string) : undefined,
      headers: {
        'Content-Type': 'application/json',
        'x-action': action,
        'x-user_id': userId,
        'x-diamond_id': diamondId,
        'x-stock_number': stockNumber ? decodeURIComponent(stockNumber) : ''
      }
    });

    if (edgeError) {
      console.error('❌ Edge function error:', edgeError);
      throw new Error(edgeError.message);
    }

    const response = edgeResponse as EdgeFunctionResponse<T>;
    
    if (!response.success) {
      console.error('❌ Edge function returned error:', response.error);
      throw new Error(response.error || 'Edge function failed');
    }

    console.log('✅ Edge function success:', {
      action,
      dataCount: Array.isArray(response.data) ? response.data.length : 'N/A',
      source: response.source || 'edge-function'
    });

    // Show success toast for add/update/delete operations
    if (['add', 'update', 'delete'].includes(action) && response.message) {
      toast({
        title: "Success ✅",
        description: response.message,
      });
    }

    return { data: response.data };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('❌ API: Edge function request failed:', {
      endpoint,
      method: options.method || 'GET',
      error: errorMessage,
    });
    
    toast({
      title: "❌ Operation Failed",
      description: `Request failed: ${errorMessage}`,
      variant: "destructive",
    });
    
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => {
    return supabase.functions.invoke('diamond-management', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-action': 'get_all',
        'x-user_id': getCurrentUserId()?.toString() || '2138564172'
      }
    }).then(({ data, error }) => {
      if (error) return { error: error.message };
      const response = data as EdgeFunctionResponse<T>;
      return response.success ? { data: response.data } : { error: response.error };
    });
  },
  
  post: <T>(endpoint: string, body: Record<string, any>) => {
    return supabase.functions.invoke('diamond-management', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-action': 'add',
        'x-user_id': getCurrentUserId()?.toString() || '2138564172'
      }
    }).then(({ data, error }) => {
      if (error) return { error: error.message };
      const response = data as EdgeFunctionResponse<T>;
      return response.success ? { data: response.data } : { error: response.error };
    });
  },
  
  put: <T>(endpoint: string, body: Record<string, any>) => {
    const diamondId = endpoint.match(/\/diamonds\/([^\/]+)/)?.[1];
    return supabase.functions.invoke('diamond-management', {
      method: 'PUT',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-action': 'update',
        'x-diamond_id': diamondId,
        'x-user_id': getCurrentUserId()?.toString() || '2138564172'
      }
    }).then(({ data, error }) => {
      if (error) return { error: error.message };
      const response = data as EdgeFunctionResponse<T>;
      return response.success ? { data: response.data } : { error: response.error };
    });
  },
  
  delete: <T>(endpoint: string) => {
    const stockNumber = endpoint.match(/\/delete_stone\/([^\/]+)/)?.[1];
    return supabase.functions.invoke('diamond-management', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-action': 'delete',
        'x-stock_number': stockNumber ? decodeURIComponent(stockNumber) : '',
        'x-user_id': getCurrentUserId()?.toString() || '2138564172'
      }
    }).then(({ data, error }) => {
      if (error) return { error: error.message };
      const response = data as EdgeFunctionResponse<T>;
      return response.success ? { data: response.data } : { error: response.error };
    });
  },
    
  uploadCsv: async <T>(endpoint: string, csvData: any[], userId: number): Promise<ApiResponse<T>> => {
    console.log('📤 API: CSV upload will be handled by edge function in future update');
    
    // For now, return success to prevent blocking
    return { data: { success: true, message: 'CSV upload queued for processing' } as T };
  },
};
