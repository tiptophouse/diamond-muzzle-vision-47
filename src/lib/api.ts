
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
  getAllStones: () => `/get_all_stones`,
  createReport: () => `/create-report`,
  getReport: (reportId: string) => `/get-report?diamond_id=${reportId}`,
  // Legacy endpoints for compatibility
  getDashboardStats: (userId: number) => `/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/users/${userId}/inventory?page=${page}&limit=${limit}`,
  uploadInventory: (userId: number) => `/users/${userId}/inventory/upload`,
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
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ifj9ov1rh20fslfp`, // Your backend access token
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

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
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
    
  upload: async <T>(endpoint: string, file: File): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ifj9ov1rh20fslfp`, // Include auth for uploads
      }, // Let the browser set the content type with boundary
    });
  },
};
