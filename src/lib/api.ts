import { toast } from "@/components/ui/use-toast";

// Update this to point to your FastAPI backend
const API_BASE_URL = "https://api.mazalbot.com/api/v1"; // Your production FastAPI URL

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number) {
  currentUserId = userId;
  console.log('Current user ID set to:', userId);
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

export const apiEndpoints = {
  getAllStones: (userId: number) => {
    const userParam = `?user_id=${userId}`;
    return `/get_all_stones${userParam}`;
  },
  uploadInventory: () => `/upload-inventory`,
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

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log('Making API request to:', url);
    console.log('Request options:', { ...options, body: options.body ? '[FormData/Body]' : undefined });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ifj9ov1rh20fslfp`, // Your backend access token
        ...options.headers,
        // Don't override Content-Type for FormData uploads
      },
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log('Non-JSON response:', text);
      data = text;
    }

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data 
        ? (data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`)
        : `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    console.log('API Response data:', data);
    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('API Error:', errorMessage);
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
    console.log('Uploading CSV data to FastAPI:', { endpoint, dataLength: csvData.length, userId });
    
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
