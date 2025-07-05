

export const apiEndpoints = {
  // Authentication
  signIn: () => '/sign-in/',
  verifyTelegram: () => '/verify-telegram',
  
  // Diamonds/Inventory
  getAllStones: (userId: number) => `/get_all_stones?user_id=${userId}`,
  addStone: () => '/add_stone',
  addDiamond: () => '/diamonds',
  updateStone: () => '/update_stone',
  updateDiamond: (diamondId: string) => `/diamonds/${diamondId}`,
  deleteStone: () => '/delete_stone',
  deleteDiamond: (diamondId: string) => `/delete_stone/${diamondId}?diamond_id=${diamondId}`,
  uploadCsv: () => '/upload_csv',
  uploadInventory: () => '/upload_csv',
  
  // Inventory Management
  deleteAllInventory: (userId: number) => `/inventory/delete_all?user_id=${userId}`,
  updateAllInventory: (userId: number) => `/inventory/update_all?user_id=${userId}`,
  
  // Store
  getStoreStones: () => '/store/stones',
  
  // Analytics & Insights
  getInsights: (userId: number) => `/insights?user_id=${userId}`,
  getDashboard: (userId: number) => `/dashboard?user_id=${userId}`,
  getDashboardStats: (userId: number) => `/dashboard/stats?user_id=${userId}`,
  
  // Reports  
  getReports: (userId: number) => `/reports?user_id=${userId}`,
  createReport: () => '/create-report',
  getReport: (diamondId: number) => `/get-report?diamond_id=${diamondId}`,
  
  // Admin Actions
  blockUser: () => '/admin/block_user',
  unblockUser: (userId: number) => `/admin/unblock_user/${userId}`,
  sendMessageToUser: () => '/admin/send_message',
  getAllClients: () => '/admin/clients',
  
  // Payment Management
  removeUserPayments: (userId: number) => `/payments/user/${userId}`,
  removeAllPayments: () => '/payments/all',
  getUserPayments: (userId: number) => `/payments/user/${userId}`,
  getPaymentStats: () => '/payments/stats',
  sendPaymentRequest: () => '/payment_request',
  
  // Health Check
  isApiAlive: () => '/alive',
};

