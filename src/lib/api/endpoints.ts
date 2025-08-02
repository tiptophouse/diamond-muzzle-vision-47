
export const apiEndpoints = {
  alive: () => "/",
  getAllStones: (userId?: number) => `/api/v1/get_all_stones${userId ? `?user_id=${userId}` : ''}`,
  addDiamond: (userId: number) => `/api/v1/diamonds?user_id=${userId}`,
  addDiamondsBatch: (userId: number) => `/api/v1/diamonds/batch?user_id=${userId}`,
  updateDiamond: (diamondId: string, userId: number) => `/api/v1/diamonds/${diamondId}?user_id=${userId}`,
  deleteDiamond: (diamondId: string, userId: number) => `/api/v1/delete_stone/${diamondId}?user_id=${userId}&diamond_id=${diamondId}`,
  uploadCsv: (userId: number) => `/api/v1/upload/csv?user_id=${userId}`,
  uploadInventory: () => `/api/v1/upload/inventory`,
  updateAllInventory: (userId: number) => `/api/v1/inventory/update-all?user_id=${userId}`,
  deleteAllInventory: (userId: number) => `/api/v1/inventory/delete-all?user_id=${userId}`,
  
  // Admin endpoints
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  getDashboardStats: (userId: number) => `/api/v1/admin/dashboard-stats?user_id=${userId}`,
  getAllClients: () => `/api/v1/admin/clients`,
  
  // Payment endpoints
  removeUserPayments: (userId: number) => `/api/v1/payments/user/${userId}`,
  removeAllPayments: () => `/api/v1/payments/all`,
  getUserPayments: (userId: number) => `/api/v1/payments/user/${userId}`,
  getPaymentStats: () => `/api/v1/payments/stats`,
  
  // Auth endpoints
  verifyTelegram: () => `/api/v1/auth/verify-telegram`,
};
