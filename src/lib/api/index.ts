
export { api as default, api, type ApiClient, type ApiResponse } from './client';
export { apiEndpoints } from './endpoints';
export { API_CONFIG } from './config';
export const API_BASE_URL = API_CONFIG.baseURL;

// User context management
let currentUserId: number | null = null;

export const setCurrentUserId = (userId: number) => {
  currentUserId = userId;
};

export const getCurrentUserId = () => currentUserId;
