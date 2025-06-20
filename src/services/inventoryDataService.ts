
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching data from FastAPI for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch from FastAPI', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi'
  };
  
  try {
    // First try to fetch from FastAPI backend
    console.log('🚀 INVENTORY SERVICE: Attempting FastAPI connection...');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', result.error);
      throw new Error(result.error);
    }
    
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned', result.data.length, 'diamonds');
      
      return {
        data: result.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: FastAPI data fetched',
          totalDiamonds: result.data.length,
          dataSource: 'fastapi',
          endpoint
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: FastAPI returned empty data');
    throw new Error('No diamonds found in FastAPI response');
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI connection failed:", error);
    
    // Fallback to mock data only if FastAPI is completely unreachable
    console.log('🔄 INVENTORY SERVICE: Using mock data as fallback');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data after FastAPI failure',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_fallback'
      }
    };
  }
}
