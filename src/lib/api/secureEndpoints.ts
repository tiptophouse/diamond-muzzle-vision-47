
// Secure API endpoints with user validation
export const secureApiEndpoints = {
  // User-specific inventory endpoints
  getUserInventory: (userId: number) => `/api/inventory/user/${userId}`,
  addUserDiamond: (userId: number) => `/api/inventory/user/${userId}/add`,
  updateUserDiamond: (diamondId: string, userId: number) => `/api/inventory/user/${userId}/diamond/${diamondId}`,
  deleteUserDiamond: (diamondId: string, userId: number) => `/api/inventory/user/${userId}/diamond/${diamondId}`,
  
  // User-specific chat endpoints  
  getUserChatHistory: (userId: number) => `/api/chat/user/${userId}/history`,
  sendUserMessage: (userId: number) => `/api/chat/user/${userId}/message`,
  
  // User-specific image endpoints
  uploadUserImage: (userId: number) => `/api/images/user/${userId}/upload`,
  getUserImages: (userId: number) => `/api/images/user/${userId}`,
  
  // Security validation
  validateUserAccess: (userId: number) => `/api/security/validate/${userId}`,
  getUserPermissions: (userId: number) => `/api/security/permissions/${userId}`,
};

// Secure API wrapper with user validation
export class SecureApiClient {
  private currentUserId: number | null = null;
  
  setCurrentUser(userId: number) {
    this.currentUserId = userId;
    console.log('🔒 Secure API client set for user:', userId);
  }
  
  private async validateRequest(endpoint: string, userId?: number): Promise<boolean> {
    const requestUserId = userId || this.currentUserId;
    
    if (!requestUserId) {
      console.error('🚨 Security violation: No user ID for API request');
      return false;
    }
    
    // Ensure endpoint contains the correct user ID
    if (!endpoint.includes(`/user/${requestUserId}/`)) {
      console.error('🚨 Security violation: User ID mismatch in endpoint');
      return false;
    }
    
    return true;
  }
  
  async get(endpoint: string, userId?: number) {
    if (!(await this.validateRequest(endpoint, userId))) {
      throw new Error('Security validation failed');
    }
    
    // Proceed with secure API call
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-ID': (userId || this.currentUserId)?.toString() || '',
      }
    });
    
    return response.json();
  }
  
  async post(endpoint: string, data: any, userId?: number) {
    if (!(await this.validateRequest(endpoint, userId))) {
      throw new Error('Security validation failed');
    }
    
    // Ensure data contains correct user ID
    if (data && !data.user_id) {
      data.user_id = userId || this.currentUserId;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-ID': (userId || this.currentUserId)?.toString() || '',
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
  
  async delete(endpoint: string, userId?: number) {
    if (!(await this.validateRequest(endpoint, userId))) {
      throw new Error('Security validation failed');
    }
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_ACCESS_TOKEN}`,
        'X-User-ID': (userId || this.currentUserId)?.toString() || '',
      }
    });
    
    return response.json();
  }
}

export const secureApiClient = new SecureApiClient();
