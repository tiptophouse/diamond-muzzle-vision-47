
export const API_CONFIG = {
  baseURL: 'https://api.mazalbot.com/api/v1',
  timeout: 30000,
};

export const API_BASE_URL = API_CONFIG.baseURL;

export const API_ENDPOINTS = {
  diamonds: '/diamonds',
  upload: '/upload',
  store: '/store',
  analytics: '/analytics',
};

// User context management
let currentUserId: number | null = null;

export const setCurrentUserId = (userId: number) => {
  currentUserId = userId;
};

export const getCurrentUserId = () => currentUserId;
