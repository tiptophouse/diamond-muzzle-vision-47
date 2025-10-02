export const apiEndpoints = {
  // Health check
  alive: () => `/api/v1/alive`,
  
  // Stone/Diamond management - CORRECTED to match FastAPI spec with pagination support
  getAllStones: (userId: number, limit?: number, offset?: number) => {
    let url = `/api/v1/get_all_stones?user_id=${userId}`;
    if (limit !== undefined) url += `&limit=${limit}`;
    if (offset !== undefined) url += `&offset=${offset}`;
    return url;
  },
  
  // Create diamond - POST /api/v1/diamonds?user_id={user_id}
  addDiamond: (userId: number) => `/api/v1/diamonds?user_id=${userId}`,
  
  // Batch diamond upload - POST /api/v1/diamonds/batch?user_id={user_id}
  addDiamondsBatch: (userId: number) => `/api/v1/diamonds/batch?user_id=${userId}`,
  
  // Update diamond - PUT /api/v1/diamonds/{diamond_id}?user_id={user_id}
  updateDiamond: (diamondId: string, userId: number) => `/api/v1/diamonds/${diamondId}?user_id=${userId}`,
  
  // CORRECTED Delete diamond endpoint to match FastAPI spec
  deleteDiamond: (diamondId: string, userId: number) => `/api/v1/delete_stone/${diamondId}?user_id=${userId}`,
  
  // SFTP endpoints - CORRECTED to include proper auth
  sftpProvision: () => `/api/v1/sftp/provision`,
  sftpStatus: (telegramId: number) => `/api/v1/sftp/status/${telegramId}`,
  sftpTestConnection: () => `/api/v1/sftp/test-connection`,
  sftpDeactivate: () => `/api/v1/sftp/deactivate`,
  
  // Reports
  createReport: () => `/api/v1/create-report`,
  getReport: (diamondId: string) => `/api/v1/get-report?diamond_id=${diamondId}`,
  
  // Payment
  paymentRequest: () => `/api/v1/payment_request`,
  
  // CORRECTED Authentication endpoint
  signIn: () => `/api/v1/sign-in/`,
  
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

  // Search endpoints - ADDED
  getSearchResults: (userId: number, limit: number = 10, offset: number = 0) => `/api/v1/get_search_results?user_id=${userId}&limit=${limit}&offset=${offset}`,
  getSearchResultsCount: (userId: number) => `/api/v1/get_search_results_count?user_id=${userId}`,
  
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
