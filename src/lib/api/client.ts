
import axios, { AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  status?: number;
  error?: string;
}

const handleApiError = <T>(error: any): ApiResponse<T> => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('API Error:', status, message);
    return {
      data: null,
      success: false,
      status: status,
      error: message,
    };
  } else {
    console.error('Non-Axios Error:', error);
    return {
      data: null,
      success: false,
      error: 'An unexpected error occurred',
    };
  }
};

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ApiClient {
  get: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: string, body: Record<string, any>) => Promise<ApiResponse<T>>;
  put: <T>(endpoint: string, body: Record<string, any>) => Promise<ApiResponse<T>>;
  delete: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  uploadCsv: (file: File, userId: number) => Promise<ApiResponse<any>>;
}

export const api: ApiClient = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<T> = await apiClient.get(endpoint);
      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  post: async <T>(endpoint: string, body: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<T> = await apiClient.post(endpoint, body);
      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  put: async <T>(endpoint: string, body: Record<string, any>): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<T> = await apiClient.put(endpoint, body);
      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(endpoint);
      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  uploadCsv: async (file: File, userId: number): Promise<ApiResponse<any>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId.toString());

      const response = await apiClient.post('/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        data: response.data,
        success: true,
        status: response.status,
      };
    } catch (error: any) {
      return handleApiError<any>(error);
    }
  },
};

export default api;
