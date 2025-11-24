export const apiEndpoints = {
  // Health check
  alive: () => `/api/v1/alive`,
  
  // Stone/Diamond management - All use JWT for user_id
  getAllStones: (limit?: number, offset?: number) => {
    let url = `/api/v1/get_all_stones`;
    const params = [];
    if (limit !== undefined) params.push(`limit=${limit}`);
    if (offset !== undefined) params.push(`offset=${offset}`);
    return url + (params.length ? `?${params.join('&')}` : '');
  },
  
  // Create diamond - POST /api/v1/diamonds (user_id from JWT)
  addDiamond: () => `/api/v1/diamonds`,
  
  // Batch diamond upload - POST /api/v1/diamonds/batch (user_id from JWT)
  addDiamondsBatch: () => `/api/v1/diamonds/batch`,
  
  // Update diamond - PUT /api/v1/diamonds/{diamond_id} (user_id from JWT)
  updateDiamond: (diamondId: number) => `/api/v1/diamonds/${diamondId}`,
  
  // Delete diamond - DELETE /api/v1/delete_stone/{diamond_id} (user_id from JWT)
  deleteDiamond: (diamondId: number) => `/api/v1/delete_stone/${diamondId}`,
  
  // SFTP endpoints - JWT-based auth (no user_id in URL)
  sftpProvision: () => `/api/v1/sftp/provision`,
  sftpStatus: () => `/api/v1/sftp/status`,
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
  // Get inventory - GET /api/v1/get_inventory?user_id={user_id}
  getInventory: (userId: number) => `/api/v1/get_inventory?user_id=${userId}`,
  
  // Payment management endpoints
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,

  // Search endpoints - JWT-based (no user_id in URL)
  getSearchResults: (limit: number = 10, offset: number = 0) => `/api/v1/get_search_results?limit=${limit}&offset=${offset}`,
  getSearchResultsCount: () => `/api/v1/get_search_results_count`,
  
  // Seller notification endpoints - JWT-based (no user_id in URL)
  sellerNotifications: (limit: number = 20, offset: number = 0) => `/api/v1/seller/notifications?limit=${limit}&offset=${offset}`,
  sellerNotificationsCount: () => `/api/v1/seller/notifications/count`,
  getSellerNotifications: (params?: { limit?: number; offset?: number }) => {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    return `/api/v1/seller/notifications?limit=${limit}&offset=${offset}`;
  },
  getSellerNotificationsCount: () => `/api/v1/seller/notifications/count`,
  
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
