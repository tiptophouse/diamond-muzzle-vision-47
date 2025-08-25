
export const apiEndpoints = {
  // Authentication
  verifyTelegram: () => '/auth/telegram/verify',
  
  // Diamond inventory management
  getUserDiamonds: (userId: number) => `/diamonds/${userId}`,
  addDiamond: () => '/diamonds',
  updateDiamond: (stockNumber: string) => `/diamonds/${stockNumber}`,
  deleteDiamond: (stockNumber: string) => `/diamonds/${stockNumber}`,
  
  // Store operations
  getStoreDiamonds: () => '/store/diamonds',
  getPublicDiamond: (stockNumber: string) => `/store/diamond/${stockNumber}`,
  
  // File uploads
  uploadCsv: () => '/upload/csv',
  uploadSingleDiamond: () => '/upload/single',
  uploadInventory: () => '/upload/inventory',
  
  // Analytics
  getAnalytics: (userId: number) => `/analytics/${userId}`,
  
  // Admin operations
  getUsers: () => '/admin/users',
  getUserStats: () => '/admin/stats',
  
  // Missing endpoints that are being used in hooks
  alive: () => '/health',
  getAllStones: () => '/diamonds/all',
  getDashboardStats: (userId: number) => `/dashboard/stats/${userId}`,
  getAllClients: () => '/admin/clients',
  deleteAllInventory: (userId: number) => `/diamonds/${userId}/all`,
  updateAllInventory: (userId: number) => `/diamonds/${userId}/bulk`,
  blockUser: () => '/admin/users/block',
  unblockUser: (userId: number) => `/admin/users/${userId}/unblock`,
  sendMessageToUser: () => '/admin/messages/send',
  removeUserPayments: () => '/admin/payments/user/remove',
  removeAllPayments: () => '/admin/payments/all/remove',
  getUserPayments: () => '/admin/payments/user',
  getPaymentStats: () => '/admin/payments/stats',
} as const;
