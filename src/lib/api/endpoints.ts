
export const apiEndpoints = {
  // Authentication
  verifyTelegram: () => '/auth/verify-telegram',
  
  // Stones/Diamonds management
  getAllStones: (userId: number) => `/api/v1/get_all_stones?user_id=${userId}`,
  addIndividualStone: () => '/api/v1/add_individual_stone',
  deleteStone: (stoneId: string, userId: number) => `/api/v1/delete_stone/${stoneId}?user_id=${userId}`,
  updateStone: (stoneId: string) => `/api/v1/update_stone/${stoneId}`,
  
  // CSV operations
  uploadCsv: () => '/api/v1/upload_csv',
  
  // Analytics
  getAnalytics: (userId: number) => `/api/v1/analytics?user_id=${userId}`,
};
