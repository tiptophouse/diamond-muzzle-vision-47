
export const apiEndpoints = {
  getAllStones: (userId: number) => {
    // Use the correct endpoint WITH /api/v1/ prefix to match FastAPI backend
    const endpoint = `/api/v1/get_all_stones?user_id=${userId}`;
    console.log('🔧 API: Building getAllStones endpoint:', endpoint, 'for user:', userId, 'type:', typeof userId);
    return endpoint;
  },
  verifyTelegram: () => `/api/v1/verify-telegram`,
  uploadInventory: () => `/api/v1/upload-inventory`,
  addDiamond: () => `/api/v1/diamonds`, // Correct endpoint from OpenAPI schema
  deleteDiamond: (diamondId: string) => `/api/v1/delete_stone/${diamondId}`, // Path + query param
  updateDiamond: (diamondId: string) => `/api/v1/diamonds/${diamondId}`, // Correct endpoint from OpenAPI schema
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
