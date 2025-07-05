

export const apiEndpoints = {
  // Authentication
  signIn: () => '/api/v1/signin',
  verifyTelegram: () => '/api/v1/verify-telegram',
  
  // Diamonds/Inventory
  getAllStones: (userId: number) => `/api/v1/get_all_stones?user_id=${userId}`,
  addStone: () => '/api/v1/add_stone',
  addDiamond: () => '/api/v1/diamonds',
  updateStone: () => '/api/v1/update_stone',
  updateDiamond: (diamondId: string) => `/api/v1/diamonds/${diamondId}`,
  deleteStone: () => '/api/v1/delete_stone',
  deleteDiamond: (diamondId: string) => `/api/v1/delete_stone/${diamondId}`,
  uploadCsv: () => '/api/v1/upload_csv',
  uploadInventory: () => '/api/v1/upload_csv',
  
  // Inventory Management
  deleteAllInventory: (userId: number) => `/api/v1/inventory/delete_all?user_id=${userId}`,
  updateAllInventory: (userId: number) => `/api/v1/inventory/update_all?user_id=${userId}`,
  
  // Store
  getStoreStones: () => '/api/v1/store/stones',
  
  // Analytics & Insights
  getInsights: (userId: number) => `/api/v1/insights?user_id=${userId}`,
  getDashboard: (userId: number) => `/api/v1/dashboard?user_id=${userId}`,
  getDashboardStats: (userId: number) => `/api/v1/dashboard/stats?user_id=${userId}`,
  
  // Reports
  getReports: (userId: number) => `/api/v1/reports?user_id=${userId}`,
  
  // Admin Actions
  blockUser: () => '/api/v1/admin/block_user',
  unblockUser: (userId: number) => `/api/v1/admin/unblock_user/${userId}`,
  sendMessageToUser: () => '/api/v1/admin/send_message',
  getAllClients: () => '/api/v1/admin/clients',
  
  // Payment Management
  removeUserPayments: (userId: number) => `/api/v1/payments/user/${userId}`,
  removeAllPayments: () => '/api/v1/payments/all',
  getUserPayments: (userId: number) => `/api/v1/payments/user/${userId}`,
  getPaymentStats: () => '/api/v1/payments/stats',
};

