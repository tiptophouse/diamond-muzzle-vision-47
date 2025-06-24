
export const apiEndpoints = {
  // Core inventory endpoints - matching OpenAPI schema exactly
  getAllStones: (userId: number) => {
    const endpoint = `/api/v1/get_all_stones?user_id=${userId}`;
    console.log('🔧 API: Building getAllStones endpoint:', endpoint, 'for user:', userId);
    return endpoint;
  },
  
  // Authentication endpoints
  verifyTelegram: () => `/api/v1/verify-telegram`,
  
  // Inventory management endpoints - using correct FastAPI paths
  addDiamond: () => `/api/v1/diamonds`, // POST /api/v1/diamonds
  updateDiamond: (diamondId: string) => `/api/v1/diamonds/${diamondId}`, // PUT /api/v1/diamonds/{diamond_id}
  deleteDiamond: (diamondId: string) => `/api/v1/delete_stone/${diamondId}`, // DELETE /api/v1/delete_stone/{id}
  
  // File upload endpoints
  uploadInventory: () => `/api/v1/upload-inventory`,
  
  // Reporting endpoints
  createReport: () => `/api/v1/create-report`,
  getReport: (reportId: string) => `/api/v1/get-report?diamond_id=${reportId}`,
  
  // Analytics endpoints (assuming they exist)
  getDashboardStats: (userId: number) => `/api/v1/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/api/v1/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/api/v1/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/api/v1/users/${userId}/inventory?page=${page}&limit=${limit}`,
  
  // Payment management endpoints
  paymentRequest: () => `/api/v1/payment_request`,
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
  
  // Bulk inventory management
  deleteAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/delete-all`,
  updateAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/update-all`,
  
  // System health
  alive: () => `/api/v1/alive`,
};
