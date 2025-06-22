
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172; // Use admin ID if no user set
  
  console.log('🔍 INVENTORY SERVICE: Fetching data from FastAPI backend for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch from FastAPI backend', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi_backend',
    apiUrl: apiEndpoints.getAllStones(userId)
  };
  
  try {
    // First try to fetch from your FastAPI backend
    console.log('📡 INVENTORY SERVICE: Calling FastAPI endpoint:', apiEndpoints.getAllStones(userId));
    
    const response = await api.get<any[]>(apiEndpoints.getAllStones(userId));
    
    if (response.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI error:', response.error);
      throw new Error(`FastAPI Error: ${response.error}`);
    }
    
    if (response.data && response.data.length > 0) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned', response.data.length, 'diamonds');
      
      return {
        data: response.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: FastAPI data fetched',
          totalDiamonds: response.data.length,
          dataSource: 'fastapi_backend',
          sampleData: response.data.slice(0, 2) // First 2 items for debugging
        }
      };
    } else {
      console.warn('⚠️ INVENTORY SERVICE: FastAPI returned empty data');
      throw new Error('No diamonds found in FastAPI response');
    }
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI request failed:", error);
    
    // Fallback to mock data only if FastAPI is completely unreachable
    console.log('🔄 INVENTORY SERVICE: FastAPI unavailable, using mock data as fallback');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data (FastAPI unreachable)',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_fallback_after_api_error'
      },
      error: `FastAPI Backend Error: ${error instanceof Error ? error.message : String(error)}. Using sample data.`
    };
  }
}
