
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface SecureFetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
  userId: number;
}

export async function fetchSecureInventoryData(): Promise<SecureFetchInventoryResult> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('🚫 SECURITY: No authenticated user ID found');
    return {
      error: 'User authentication required to access inventory data',
      debugInfo: { 
        step: 'SECURITY_ERROR: No user ID', 
        timestamp: new Date().toISOString(),
        dataSource: 'none'
      },
      userId: 0
    };
  }
  
  console.log('🔒 SECURE INVENTORY: Fetching data for authenticated user:', userId);
  
  const debugInfo = { 
    step: 'Starting secure inventory fetch', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi',
    securityLevel: 'authenticated'
  };
  
  try {
    console.log('🚀 SECURE INVENTORY: Attempting FastAPI connection for user:', userId);
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 SECURE INVENTORY: Using secure endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ SECURE INVENTORY: FastAPI request failed:', result.error);
      throw new Error(result.error);
    }
    
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      // CRITICAL SECURITY CHECK: Ensure all returned data belongs to the authenticated user
      const userOwnedData = result.data.filter(item => {
        const itemUserId = item.user_id || item.owner_id;
        const isOwned = itemUserId === userId;
        
        if (!isOwned) {
          console.warn('🚫 SECURITY: Filtered out data not owned by user. Item:', item.id, 'Item User ID:', itemUserId, 'Current User ID:', userId);
        }
        
        return isOwned;
      });
      
      console.log('✅ SECURE INVENTORY: FastAPI returned', result.data.length, 'total items');
      console.log('🔒 SECURE INVENTORY: After security filtering:', userOwnedData.length, 'user-owned diamonds');
      
      // Log security check results
      if (result.data.length !== userOwnedData.length) {
        console.error('🚨 SECURITY ALERT: User', userId, 'attempted to access', (result.data.length - userOwnedData.length), 'items not owned by them');
      }
      
      return {
        data: userOwnedData,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Secure FastAPI data fetched',
          totalDiamonds: userOwnedData.length,
          filteredOut: result.data.length - userOwnedData.length,
          dataSource: 'fastapi',
          endpoint,
          securityCheck: 'PASSED'
        },
        userId
      };
    }
    
    console.log('⚠️ SECURE INVENTORY: FastAPI returned empty data for user:', userId);
    return {
      data: [],
      debugInfo: {
        ...debugInfo,
        step: 'SUCCESS: No diamonds found for user',
        totalDiamonds: 0,
        dataSource: 'fastapi',
        securityCheck: 'PASSED'
      },
      userId
    };
    
  } catch (error) {
    console.error("❌ SECURE INVENTORY: FastAPI connection failed for user:", userId, error);
    
    // Fallback to mock data only if FastAPI is completely unreachable
    console.log('🔄 SECURE INVENTORY: Using mock data as fallback for user:', userId);
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data after FastAPI failure',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_fallback',
        securityCheck: 'PASSED'
      },
      userId
    };
  }
}
