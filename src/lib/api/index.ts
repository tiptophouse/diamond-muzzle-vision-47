
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mazalbot.com';

let currentUserId: number | null = null;

export const setCurrentUserId = (userId: number) => {
  currentUserId = userId;
  console.log('🔧 API: Current user ID set to:', userId, 'type:', typeof userId);
};

export const getCurrentUserId = () => {
  // Try to get from Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  
  // Return stored user ID or fallback
  const storedUserId = localStorage.getItem('telegram_user_id');
  return currentUserId || (storedUserId ? parseInt(storedUserId) : null);
};

export const getBackendAccessToken = async (): Promise<string | null> => {
  // For now, return the hardcoded token - in production this should be more secure
  return 'ifj9ov1rh20fslfp';
};

export const verifyTelegramUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/verify-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getVerificationResult = async (userId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/profile/${userId}`);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const apiEndpoints = {
  inventory: '/api/v1/inventory',
  deleteDiamond: (id: string) => `/api/v1/delete_stone/${id}`,
  updateDiamond: (id: string) => `/api/v1/diamonds/${id}`,
  addDiamond: '/api/v1/diamonds',
  userProfile: (telegramId: number) => `/api/v1/user/profile/${telegramId}`,
  getAllStones: (userId: number) => `/api/v1/get_all_stones?user_id=${userId}`,
  getAllClients: () => `/api/v1/clients`,
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  deleteAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/delete-all`,
  updateAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/update-all`,
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,
  uploadInventory: () => `/api/v1/upload-inventory`,
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

  uploadCsv: async (endpoint: string, formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
