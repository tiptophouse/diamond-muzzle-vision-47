
export const apiEndpoints = {
  // Authentication
  verifyTelegram: () => '/auth/verify-telegram',
  
  // Stones/Diamonds management (matching FastAPI spec)
  getAllStones: (userId: number) => `/api/v1/get_all_stones?user_id=${userId}`,
  addIndividualStone: () => '/api/v1/diamonds',
  deleteStone: (stoneId: string, diamondId: number) => `/api/v1/delete_stone/${stoneId}?diamond_id=${diamondId}`,
  updateStone: (stoneId: string) => `/api/v1/diamonds/${stoneId}`,
  
  // Legacy diamond endpoints (for backward compatibility)
  addDiamond: () => '/api/v1/diamonds',
  deleteDiamond: (diamondId: string, diamondIdParam: number) => `/api/v1/delete_stone/${diamondId}?diamond_id=${diamondIdParam}`,
  updateDiamond: (diamondId: string) => `/api/v1/diamonds/${diamondId}`,
  
  // CSV operations
  uploadCsv: () => '/api/v1/upload_csv',
  
  // Analytics
  getAnalytics: (userId: number) => `/api/v1/analytics?user_id=${userId}`,
  getDashboardStats: (userId: number) => `/api/v1/dashboard_stats?user_id=${userId}`,
  
  // Admin operations
  blockUser: (userId: number) => `/api/v1/admin/block_user/${userId}`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock_user/${userId}`,
  sendMessageToUser: () => '/api/v1/admin/send_message',
  getAllClients: () => '/api/v1/admin/clients',
  
  // Inventory management
  deleteAllInventory: (userId: number) => `/api/v1/inventory/delete_all?user_id=${userId}`,
  updateAllInventory: () => '/api/v1/inventory/update_all',
  
  // Payment management
  removeUserPayments: (userId: number) => `/api/v1/payments/user/${userId}`,
  removeAllPayments: () => '/api/v1/payments/all',
  getUserPayments: (userId: number) => `/api/v1/payments/user/${userId}`,
  getPaymentStats: () => '/api/v1/payments/stats',
};
