export const apiEndpoints = {
  // Health check
  alive: () => `/api/v1/alive`,
  
  // Stone/Diamond management
  getAllStones: (userId?: number) => {
    const endpoint = `/api/v1/get_all_stones`;
    if (userId) {
      return `${endpoint}?user_id=${userId}`;
    }
    return endpoint;
  },
  
  // Create diamond - POST /api/v1/diamonds?user_id={user_id}
  addDiamond: (userId: number) => `/api/v1/diamonds?user_id=${userId}`,
  
  // Batch diamond upload - POST /api/v1/diamonds/batch?user_id={user_id}
  addDiamondsBatch: (userId: number) => `/api/v1/diamonds/batch?user_id=${userId}`,
  
  // Update diamond - PUT /api/v1/diamonds/{diamond_id}?user_id={user_id}
  updateDiamond: (diamondId: string, userId: number) => `/api/v1/diamonds/${diamondId}?user_id=${userId}`,
  
  // Delete diamond - DELETE /api/v1/delete_stone/{diamond_id}?user_id={user_id}&diamond_id={diamond_id}
  deleteDiamond: (diamondId: string, userId: number) => `/api/v1/delete_stone/${diamondId}?user_id=${userId}&diamond_id=${diamondId}`,
  
  // Reports
  createReport: () => `/api/v1/create-report`,
  getReport: (diamondId: string) => `/api/v1/get-report?diamond_id=${diamondId}`,
  
  // Payment
  paymentRequest: () => `/api/v1/payment_request`,
  
  // Legacy endpoints (keeping for compatibility)
  verifyTelegram: () => `/api/v1/verify-telegram`,
  uploadInventory: () => `/api/v1/upload-inventory`,
  soldDiamond: () => `/api/v1/sold`,
  getDashboardStats: (userId: number) => `/api/v1/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/api/v1/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/api/v1/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/api/v1/users/${userId}/inventory?page=${page}&limit=${limit}`,
  
  // Payment management endpoints
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,

  // Client and admin endpoints
  getAllClients: () => `/api/v1/clients`,
  getClientById: (clientId: number) => `/api/v1/clients/${clientId}`,
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  
  // Inventory management
  deleteAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/delete-all`,
  updateAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/update-all`,
};
