
export const apiEndpoints = {
  // Core inventory endpoints - JWT-based authentication with Telegram user ID filtering
  getAllStones: () => {
    const endpoint = `/api/v1/get_all_stones`;
    console.log('🔧 API: Building getAllStones endpoint with Telegram user filtering:', endpoint);
    console.log('🔧 API: Backend will filter stones by authenticated Telegram user ID from JWT token');
    return endpoint;
  },
  
  // Authentication endpoints
  verifyTelegram: () => `/api/v1/verify-telegram`,
  
  // Inventory management endpoints - using correct FastAPI paths with Telegram user isolation
  addDiamond: () => {
    console.log('🔧 API: Building addDiamond endpoint - will be associated with authenticated Telegram user');
    return `/api/v1/diamonds`; // POST /api/v1/diamonds
  },
  updateDiamond: (diamondId: string) => {
    console.log('🔧 API: Building updateDiamond endpoint for diamond:', diamondId, '- will verify ownership by Telegram user');
    return `/api/v1/diamonds/${diamondId}`; // PUT /api/v1/diamonds/{diamond_id}
  },
  deleteDiamond: (diamondId: string) => {
    console.log('🔧 API: Building deleteDiamond endpoint for diamond:', diamondId, '- will verify ownership by Telegram user');
    return `/api/v1/delete_stone/${diamondId}`; // DELETE /api/v1/delete_stone/{id}
  },
  
  // File upload endpoints
  uploadInventory: () => `/api/v1/upload-inventory`,
  
  // Reporting endpoints
  createReport: () => `/api/v1/create-report`,
  getReport: (reportId: string) => `/api/v1/get-report?diamond_id=${reportId}`,
  
  // Analytics endpoints (JWT-based user identification)
  getDashboardStats: () => `/api/v1/dashboard/stats`,
  getInventoryByShape: () => `/api/v1/inventory/by-shape`,
  getRecentSales: () => `/api/v1/sales/recent`,
  getInventory: (page: number = 1, limit: number = 10) => `/api/v1/inventory?page=${page}&limit=${limit}`,
  
  // Payment management endpoints (JWT-based user identification)
  paymentRequest: () => `/api/v1/payment_request`,
  removeUserPayments: () => `/api/v1/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: () => `/api/v1/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,

  // Client and admin endpoints
  getAllClients: () => `/api/v1/clients`,
  getClientById: (clientId: number) => `/api/v1/clients/${clientId}`,
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  
  // Bulk inventory management (JWT-based user identification)
  deleteAllInventory: () => `/api/v1/inventory/delete-all`,
  updateAllInventory: () => `/api/v1/inventory/update-all`,
  
  // System health
  alive: () => `/api/v1/alive`,
};
