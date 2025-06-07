import { toast } from "@/components/ui/use-toast";

// Update this to point to your FastAPI backend
const API_BASE_URL = "https://api.mazalbot.com/api/v1"; // Your production FastAPI URL

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId);
}

export function getCurrentUserId(): number | null {
  console.log('🔧 API: Getting current user ID:', currentUserId);
  return currentUserId;
}

export const apiEndpoints = {
  getAllStones: (userId: number) => {
    const userParam = `?user_id=${userId}`;
    const endpoint = `/get_all_stones${userParam}`;
    console.log('🔧 API: Building getAllStones endpoint:', endpoint, 'for user:', userId);
    return endpoint;
  },
  uploadInventory: () => `/upload-inventory`,
  deleteDiamond: (diamondId: string, userId: number) => `/delete_diamond?diamond_id=${diamondId}&user_id=${userId}`,
  soldDiamond: () => `/sold`, // New endpoint for marking diamonds as sold/deleted
  createReport: () => `/create-report`,
  getReport: (reportId: string) => `/get-report?diamond_id=${reportId}`,
  // Legacy endpoints for compatibility
  getDashboardStats: (userId: number) => `/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/users/${userId}/inventory?page=${page}&limit=${limit}`,
};

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get auth token from Supabase edge function instead of hardcoded value
async function getAuthToken(): Promise<string> {
  try {
    console.log('🔧 API: Fetching auth token from edge function');
    // Call edge function to get secure auth token
    const response = await fetch('/functions/v1/get-api-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get auth token');
    }
    
    const { token } = await response.json();
    console.log('✅ API: Auth token received successfully');
    return token;
  } catch (error) {
    console.error('❌ API: Error getting auth token:', error);
    throw new Error('Authentication failed');
  }
}

// Helper function to set database context for RLS
async function setDatabaseContext(userId: number) {
  try {
    console.log('🔧 API: Setting database context for user:', userId);
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Use the edge function to set session context instead of RPC
    const { error } = await supabase.functions.invoke('set-session-context', {
      body: {
        setting_name: 'app.current_user_id',
        setting_value: userId.toString()
      }
    });

    if (error) {
      console.warn('⚠️ API: Failed to set database context via edge function:', error);
    } else {
      console.log('✅ API: Database context set successfully');
    }
  } catch (error) {
    console.warn('⚠️ API: Failed to set database context:', error);
    // Don't throw - this is not critical for API calls
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('🚀 API: Making request to:', url);
    console.log('🚀 API: Current user ID:', currentUserId);
    
    // Set database context if we have a current user
    if (currentUserId) {
      await setDatabaseContext(currentUserId);
    }
    
    // Get secure auth token
    const authToken = await getAuthToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    console.log('📡 API: Response status:', response.status);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📡 API: JSON response received, data type:', typeof data, 'length:', Array.isArray(data) ? data.length : 'not array');
      if (Array.isArray(data)) {
        console.log('📡 API: Sample data (first 2 items):', data.slice(0, 2));
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
    
    // Set database context for RLS
    await setDatabaseContext(userId);
    
    // Get secure auth token
    const authToken = await getAuthToken();
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        diamonds: csvData
      }),
    });
  },
};
