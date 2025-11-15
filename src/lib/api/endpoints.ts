export const apiEndpoints = {
  // Health check
  alive: () => `/api/v1/alive`,
  
  // Stone/Diamond management - CORRECTED to match FastAPI spec with pagination support
  getAllStones: (userId: number, limit?: number, offset?: number) => {
    let url = `/api/v1/get_all_stones?user_id=${userId}`;
    if (limit !== undefined) url += `&limit=${limit}`;
    if (offset !== undefined) url += `&offset=${offset}`;
    return url;
  },
  
  // Create diamond - POST /api/v1/diamonds?user_id={user_id}
  addDiamond: (userId: number) => `/api/v1/diamonds?user_id=${userId}`,
  
  // Batch diamond upload - POST /api/v1/diamonds/batch?user_id={user_id}
  addDiamondsBatch: (userId: number) => `/api/v1/diamonds/batch?user_id=${userId}`,
  
  // Update diamond - PUT /api/v1/diamonds/{diamond_id}?user_id={user_id}
  updateDiamond: (diamondId: string, userId: number) => `/api/v1/diamonds/${diamondId}?user_id=${userId}`,
  
  // Delete diamond endpoint - accepts stock_number as path parameter
  deleteDiamond: (stockNumber: string, userId: number) => `/api/v1/delete_stone/${encodeURIComponent(stockNumber)}?user_id=${userId}`,
  
  // SFTP endpoints - CORRECTED to include proper auth
  sftpProvision: () => `/api/v1/sftp/provision`,
  sftpStatus: (telegramId: number) => `/api/v1/sftp/status/${telegramId}`,
  sftpTestConnection: () => `/api/v1/sftp/test-connection`,
  sftpDeactivate: () => `/api/v1/sftp/deactivate`,
  
  // Reports
  createReport: () => `/api/v1/create-report`,
  getReport: (diamondId: string) => `/api/v1/get-report?diamond_id=${diamondId}`,
  
  // Payment
  paymentRequest: () => `/api/v1/payment_request`,
  
  // CORRECTED Authentication endpoint
  signIn: () => `/api/v1/sign-in/`,
  
  // Legacy endpoints (keeping for compatibility)
  verifyTelegram: () => `/api/v1/verify-telegram`,
  uploadInventory: () => `/api/v1/upload-inventory`,
  soldDiamond: () => `/api/v1/sold`,
  getDashboardStats: (userId: number) => `/api/v1/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/api/v1/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/api/v1/users/${userId}/sales/recent`,
  getInventory: (userId: number, page: number = 1, limit: number = 10) => `/api/v1/users/${userId}/inventory?page=${page}&limit=${limit}`,
  
  // Payment management endpoints
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,

  // Search endpoints - ADDED (buyer-centric view)
  getSearchResults: (userId: number, limit: number = 10, offset: number = 0) => `/api/v1/get_search_results?user_id=${userId}&limit=${limit}&offset=${offset}`,
  getSearchResultsCount: (userId: number) => `/api/v1/get_search_results_count?user_id=${userId}`,
  
  // Seller notification endpoints - ADDED (seller-centric view)
  sellerNotifications: (userId: number, limit: number = 20, offset: number = 0) => `/api/v1/seller/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`,
  sellerNotificationsCount: (userId: number) => `/api/v1/seller/notifications/count?user_id=${userId}`,
  getSellerNotifications: (userId: number, params?: { limit?: number; offset?: number }) => {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    return `/api/v1/seller/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`;
  },
  getSellerNotificationsCount: (userId: number) => `/api/v1/seller/notifications/count?user_id=${userId}`,
  
  // Billing & Subscriptions - ADDED
  getBilling: () => `/api/v1/billing`,
  cancelSubscription: () => `/api/v1/billing/cancel-subscription`,
  updatePaymentMethod: () => `/api/v1/billing/update-payment-method`,
  trialSubscribe: () => `/api/v1/billing/trial-subscribe`,
  getActiveSubscription: (userId: number) => `/api/v1/user/active-subscription`,
  checkSubscriptionStatus: (userId: number) => `/api/v1/user/active-subscription`, // POST endpoint
  
  // Client and admin endpoints
  getAllClients: () => `/api/v1/clients`,
  getClientById: (clientId: number) => `/api/v1/clients/${clientId}`,
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  
  // Inventory management
  deleteAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/delete-all`,
  updateAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/update-all`,
  
  // Auction endpoints
  auctions: {
    create: () => `/api/v1/auctions`,
    getById: (auctionId: string) => `/api/v1/auctions/${auctionId}`,
    getAll: (params?: { status?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      return `/api/v1/auctions?${query.toString()}`;
    },
    placeBid: (auctionId: string) => `/api/v1/auctions/${auctionId}/bid`,
    cancel: (auctionId: string) => `/api/v1/auctions/${auctionId}/cancel`,
    myAuctions: (userId: number) => `/api/v1/users/${userId}/auctions`,
    myBids: (userId: number) => `/api/v1/users/${userId}/bids`,
  },
};
