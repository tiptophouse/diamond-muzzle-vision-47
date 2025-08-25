
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
  
  // Analytics
  getAnalytics: (userId: number) => `/analytics/${userId}`,
  
  // Admin operations
  getUsers: () => '/admin/users',
  getUserStats: () => '/admin/stats',
} as const;
