
import { toast } from "@/components/ui/use-toast";

// Production FastAPI URL
const API_BASE_URL = "https://api.mazalbot.com/api/v1";

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('🔧 Current user ID set to:', userId);
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

export const apiEndpoints = {
  getAllStones: (userId: number) => {
    const endpoint = `/get_all_stones?user_id=${userId}`;
    console.log('🔗 Building getAllStones endpoint:', { userId, endpoint, fullUrl: `${API_BASE_URL}${endpoint}` });
    return endpoint;
  },
  uploadInventory: () => `/upload-inventory`,
  deleteDiamond: (diamondId: string, userId: number) => `/delete_diamond?diamond_id=${diamondId}&user_id=${userId}`,
  createReport: () => `/create-report`,
  getReport: (reportId: string) => `/get-report?diamond_id=${reportId}`,
  getDashboardStats: (userId: number) => `/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/users/${userId}/inventory?page=${page}&limit=${limit}`,
};

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('📡 API REQUEST:', {
    url,
    method: options.method || 'GET',
    currentUserId,
    hasAuth: !!options.headers
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ifj9ov1rh20fslfp`,
        ...options.headers,
      },
    });

    console.log('📨 API RESPONSE:', {
      url,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log('📄 Non-JSON response:', text);
      data = text;
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data 
        ? (data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`)
        : `HTTP ${response.status}: ${response.statusText}`;
      
      console.error('❌ API ERROR:', {
        url,
        status: response.status,
        error: errorMessage,
        data
      });
      
      throw new Error(errorMessage);
    }

    console.log('✅ API SUCCESS:', {
      url,
      dataType: typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A'
    });

    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('💥 API FETCH ERROR:', {
      url,
      error: errorMessage,
      currentUserId
    });
    
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
    console.log('📤 Uploading CSV data:', { endpoint, dataLength: csvData.length, userId });
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ifj9ov1rh20fslfp`,
      },
      body: JSON.stringify({
        user_id: userId,
        diamonds: csvData
      }),
    });
  },
};
