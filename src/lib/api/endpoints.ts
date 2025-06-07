
export const apiEndpoints = {
  getAllStones: (userId: number) => {
    const endpoint = `/get_all_stones?user_id=${userId}`;
    console.log('🔧 API: Building getAllStones endpoint:', endpoint, 'for user:', userId, 'type:', typeof userId);
    return endpoint;
  },
  verifyTelegram: () => `/verify-telegram`,
  uploadInventory: () => `/upload-inventory`,
  deleteDiamond: (diamondId: string, userId: number) => `/delete_diamond?diamond_id=${diamondId}&user_id=${userId}`,
  soldDiamond: () => `/sold`,
  createReport: () => `/create-report`,
  getReport: (reportId: string) => `/get-report?diamond_id=${reportId}`,
  getDashboardStats: (userId: number) => `/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/users/${userId}/inventory?page=${page}&limit=${limit}`,
};
