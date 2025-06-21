export const apiEndpoints = {
  getAllStones: (userId: number) => {
    // Ensure we're using the correct user-specific endpoint for your backend
    const endpoint = `/api/v1/get_all_stones?user_id=${userId}`;
    console.log('🔧 API: Building secure getAllStones endpoint:', endpoint, 'for user:', userId, 'type:', typeof userId);
    return endpoint;
  },
  verifyTelegram: () => `/api/v1/verify-telegram`,
  uploadInventory: () => `/api/v1/upload-inventory`,
  addDiamond: (userId: number) => {
    // Add user context to diamond creation
    const endpoint = `/api/v1/diamonds?user_id=${userId}`;
    console.log('💎 API: Building secure addDiamond endpoint:', endpoint);
    return endpoint;
  },
  deleteDiamond: (diamondId: string, userId?: number) => {
    // Use the correct FastAPI delete endpoint format with user validation
    const endpoint = userId 
      ? `/api/v1/delete_stone/${diamondId}?user_id=${userId}`
      : `/api/v1/delete_stone/${diamondId}`;
    console.log('🗑️ API: Building secure delete endpoint:', endpoint, 'for diamond ID:', diamondId, 'user:', userId);
    return endpoint;
  },
  updateDiamond: (diamondId: string, userId?: number) => {
    const endpoint = userId 
      ? `/api/v1/diamonds/${diamondId}?user_id=${userId}`
      : `/api/v1/diamonds/${diamondId}`;
    console.log('📝 API: Building secure update endpoint:', endpoint);
    return endpoint;
  },
  soldDiamond: () => `/api/v1/sold`,
  createReport: () => `/api/v1/create-report`,
  getReport: (reportId: string) => `/api/v1/get-report?diamond_id=${reportId}`,
  getDashboardStats: (userId: number) => `/api/v1/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/api/v1/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/api/v1/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/api/v1/users/${userId}/inventory?page=${page}&limit=${limit}`,
  
  // Admin endpoints for user data management
  clearUserData: (userId: number) => `/api/v1/admin/users/${userId}/data`,
  getUserDataSummary: (userId: number) => `/api/v1/admin/users/${userId}/data-summary`,
  
  // Payment management endpoints
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,

  // New client and admin endpoints
  getAllClients: () => `/api/v1/clients`,
  getClientById: (clientId: number) => `/api/v1/clients/${clientId}`,
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  
  // Inventory management
  deleteAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/delete-all`,
  updateAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/update-all`,
};
