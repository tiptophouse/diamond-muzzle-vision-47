export const apiEndpoints = {
  alive: () => "/",
  getAllStones: (userId?: number) => `/api/v1/get_all_stones${userId ? `?user_id=${userId}` : ''}`,
  addDiamond: (userId: number) => `/api/v1/diamonds?user_id=${userId}`,
  addDiamondsBatch: (userId: number) => `/api/v1/diamonds/batch?user_id=${userId}`,
  updateDiamond: (diamondId: string, userId: number) => `/api/v1/diamonds/${diamondId}?user_id=${userId}`,
  deleteDiamond: (diamondId: string, userId: number) => `/api/v1/delete_stone/${diamondId}?user_id=${diamondId}&diamond_id=${diamondId}`,
  uploadCsv: (userId: number) => `/api/v1/upload/csv?user_id=${userId}`,
  updateAllInventory: (userId: number) => `/api/v1/inventory/update-all?user_id=${userId}`,
};
