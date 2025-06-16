export const apiEndpoints = {
  getAllStones: (userId: number) => {
    // Try the correct endpoint path for your backend
    const endpoint = `/api/v1/get_all_stones?user_id=${userId}`;
    console.log('🔧 API: Building getAllStones endpoint:', endpoint, 'for user:', userId, 'type:', typeof userId);
    return endpoint;
  },
  verifyTelegram: () => `/api/v1/verify-telegram`,
  uploadInventory: () => `/api/v1/upload-inventory`,
  addDiamond: () => `/api/v1/diamonds`,
  deleteDiamond: (diamondId: string) => `/api/v1/diamonds/${diamondId}`,
  updateDiamond: (diamondId: string) => `/api/v1/diamonds/${diamondId}`,
  soldDiamond: () => `/api/v1/sold`,
  createReport: () => `/api/v1/create-report`,
  getReport: (reportId: string) => `/api/v1/get-report?diamond_id=${reportId}`,
  getDashboardStats: (userId: number) => `/api/v1/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/api/v1/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/api/v1/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/api/v1/users/${userId}/inventory?page=${page}&limit=${limit}`,
  
  // Payment management endpoints
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,
};
