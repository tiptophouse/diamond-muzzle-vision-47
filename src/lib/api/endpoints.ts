
export const apiEndpoints = {
  // Authentication
  signIn: () => '/api/v1/signin',
  verifyTelegram: () => '/api/v1/verify-telegram',
  
  // Diamonds/Inventory
  getAllStones: (userId: number) => `/api/v1/get_all_stones?user_id=${userId}`,
  addStone: () => '/api/v1/add_stone',
  updateStone: () => '/api/v1/update_stone',
  deleteStone: () => '/api/v1/delete_stone',
  uploadCsv: () => '/api/v1/upload_csv',
  
  // Store
  getStoreStones: () => '/api/v1/store/stones',
  
  // Analytics & Insights
  getInsights: (userId: number) => `/api/v1/insights?user_id=${userId}`,
  getDashboard: (userId: number) => `/api/v1/dashboard?user_id=${userId}`,
  
  // Reports
  getReports: (userId: number) => `/api/v1/reports?user_id=${userId}`,
};
