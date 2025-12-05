// API Endpoints - Aligned with FastAPI OpenAPI spec

export const apiEndpoints = {
  // Health check
  alive: () => `/api/v1/alive`,
  
  // Stone/Diamond management - JWT auth only (no user_id in URL per OpenAPI spec)
  getAllStones: () => `/api/v1/get_all_stones`,
  
  // Create diamond - POST /api/v1/diamonds (JWT auth only)
  addDiamond: () => `/api/v1/diamonds`,
  
  // Batch diamond upload - POST /api/v1/diamonds/batch (JWT auth only)
  addDiamondsBatch: () => `/api/v1/diamonds/batch`,
  
  // Update diamond - PUT /api/v1/diamonds/{diamond_id} (JWT auth only)
  updateDiamond: (diamondId: number) => `/api/v1/diamonds/${diamondId}`,
  
  // Delete diamond - DELETE /api/v1/delete_stone/{diamond_id} (JWT auth only)
  deleteDiamond: (diamondId: number) => `/api/v1/delete_stone/${diamondId}`,
  
  // SFTP endpoints - JWT auth only
  sftpProvision: () => `/api/v1/sftp/provision`,
  sftpStatus: () => `/api/v1/sftp/status`,
  sftpTestConnection: () => `/api/v1/sftp/test-connection`,
  sftpDeactivate: () => `/api/v1/sftp/deactivate`,
  
  // Reports
  createReport: () => `/api/v1/create-report`,
  getReport: (diamondId: number) => `/api/v1/get-report?diamond_id=${diamondId}`,
  
  // Payment
  paymentRequest: () => `/api/v1/payment_request`,
  
  // Authentication endpoint
  signIn: () => `/api/v1/sign-in/`,
  
  // Legacy endpoints (keeping for compatibility)
  verifyTelegram: () => `/api/v1/verify-telegram`,
  uploadInventory: () => `/api/v1/upload-inventory`,
  soldDiamond: () => `/api/v1/sold`,
  getDashboardStats: (userId: number) => `/api/v1/users/${userId}/dashboard/stats`,
  getInventoryByShape: (userId: number) => `/api/v1/users/${userId}/inventory/by-shape`,
  getRecentSales: (userId: number) => `/api/v1/users/${userId}/sales/recent`,
  getInventory: (userId: number) => `/api/v1/get_inventory?user_id=${userId}`,
  
  // Payment management endpoints
  removeUserPayments: (userId: number) => `/api/v1/users/${userId}/payments/remove`,
  removeAllPayments: () => `/api/v1/payments/remove-all`,
  getUserPayments: (userId: number) => `/api/v1/users/${userId}/payments`,
  getPaymentStats: () => `/api/v1/payments/stats`,

  // Search endpoints - REQUIRES user_id per OpenAPI spec
  getSearchResults: (userId: number, limit: number = 50, offset: number = 0, resultType?: string) => {
    let url = `/api/v1/get_search_results?user_id=${userId}&limit=${limit}&offset=${offset}`;
    if (resultType) url += `&result_type=${resultType}`;
    return url;
  },
  getSearchResultsCount: (userId: number, resultType?: string) => {
    let url = `/api/v1/get_search_results_count?user_id=${userId}`;
    if (resultType) url += `&result_type=${resultType}`;
    return url;
  },
  
  // Seller notification endpoints - REQUIRES user_id per OpenAPI spec
  sellerNotifications: (userId: number, limit: number = 50, offset: number = 0) => 
    `/api/v1/seller/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`,
  sellerNotificationsCount: (userId: number) => 
    `/api/v1/seller/notifications/count?user_id=${userId}`,
  getSellerNotifications: (userId: number, params?: { limit?: number; offset?: number }) => {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    return `/api/v1/seller/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`;
  },
  getSellerNotificationsCount: (userId: number) => 
    `/api/v1/seller/notifications/count?user_id=${userId}`,
  
  // Billing & Subscriptions - JWT auth only
  getBilling: () => `/api/v1/billing`,
  cancelSubscription: () => `/api/v1/billing/cancel-subscription`,
  updatePaymentMethod: () => `/api/v1/billing/update-payment-method`,
  trialSubscribe: () => `/api/v1/billing/trial-subscribe`,
  getActiveSubscription: () => `/api/v1/user/active-subscription`,
  checkSubscriptionStatus: () => `/api/v1/user/active-subscription`,
  
  // Client and admin endpoints
  getAllClients: () => `/api/v1/clients`,
  getClientById: (clientId: number) => `/api/v1/clients/${clientId}`,
  blockUser: () => `/api/v1/admin/block-user`,
  unblockUser: (userId: number) => `/api/v1/admin/unblock-user/${userId}`,
  sendMessageToUser: () => `/api/v1/admin/send-message`,
  
  // Inventory management
  deleteAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/delete-all`,
  updateAllInventory: (userId: number) => `/api/v1/users/${userId}/inventory/update-all`,
  
  // Auction endpoints - auction_id is INTEGER per OpenAPI spec
  auctions: {
    create: () => `/api/v1/auctions/`,
    getById: (auctionId: number) => `/api/v1/auctions/${auctionId}`,
    getAll: () => `/api/v1/auctions/`,
    placeBid: (auctionId: number) => `/api/v1/auctions/${auctionId}/bid`,
    close: (auctionId: number) => `/api/v1/auctions/${auctionId}/close`,
    update: (auctionId: number) => `/api/v1/auctions/${auctionId}`,
    // Legacy endpoints
    cancel: (auctionId: number) => `/api/v1/auctions/${auctionId}/cancel`,
    myAuctions: (userId: number) => `/api/v1/users/${userId}/auctions`,
    myBids: (userId: number) => `/api/v1/users/${userId}/bids`,
  },
};
