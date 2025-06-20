
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mazalbot.com';

export const getCurrentUserId = () => {
  // Try to get from Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  
  // Fallback to localStorage or return null
  const storedUserId = localStorage.getItem('telegram_user_id');
  return storedUserId ? parseInt(storedUserId) : null;
};

export const getBackendAccessToken = async (): Promise<string | null> => {
  // For now, return the hardcoded token - in production this should be more secure
  return 'ifj9ov1rh20fslfp';
};

export const apiEndpoints = {
  inventory: '/api/v1/inventory',
  deleteDiamond: (id: string) => `/api/v1/delete_stone/${id}`,
  updateDiamond: (id: string) => `/api/v1/diamonds/${id}`,
  addDiamond: '/api/v1/diamonds',
  userProfile: (telegramId: number) => `/api/v1/user/profile/${telegramId}`,
};

export const api = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  post: async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  put: async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
