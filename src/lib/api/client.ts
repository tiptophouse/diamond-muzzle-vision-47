
import axios, { AxiosRequestConfig } from 'axios';
import { getAuthHeaders } from './auth';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const config: AxiosRequestConfig = {
        headers: await getAuthHeaders(),
      };
      const response = await axios.get(`${getBaseUrl()}${endpoint}`, config);
      return { data: response.data as T, error: null, status: response.status };
    } catch (error: any) {
      console.error('GET request failed:', error);
      return { data: null, error: error.response?.data?.detail || error.message, status: error.response?.status || 500 };
    }
  },

  post: async <T>(endpoint: string, body: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const config: AxiosRequestConfig = {
        headers: await getAuthHeaders(),
      };
      const response = await axios.post(`${getBaseUrl()}${endpoint}`, body, config);
      return { data: response.data as T, error: null, status: response.status };
    } catch (error: any) {
      console.error('POST request failed:', error);
      return { data: null, error: error.response?.data?.detail || error.message, status: error.response?.status || 500 };
    }
  },

  put: async <T>(endpoint: string, body: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const config: AxiosRequestConfig = {
        headers: await getAuthHeaders(),
      };
      const response = await axios.put(`${getBaseUrl()}${endpoint}`, body, config);
      return { data: response.data as T, error: null, status: response.status };
    } catch (error: any) {
      console.error('PUT request failed:', error);
      return { data: null, error: error.response?.data?.detail || error.message, status: error.response?.status || 500 };
    }
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const config: AxiosRequestConfig = {
        headers: await getAuthHeaders(),
      };
      const response = await axios.delete(`${getBaseUrl()}${endpoint}`, config);
      return { data: response.data as T, error: null, status: response.status };
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      return { data: null, error: error.response?.data?.detail || error.message, status: error.response?.status || 500 };
    }
  },

  uploadCsv: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    try {
      const headers = await getAuthHeaders(false);
      const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: data.detail || 'Upload failed', status: response.status };
      }

      return { data, error: null, status: response.status };
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Upload failed', 
        status: 500 
      };
    }
  },
};

// Legacy function for backward compatibility
export const fetchApi = api.get;
