
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172; // Use your admin ID as fallback
  
  console.log('🔍 INVENTORY SERVICE: Fetching real diamonds from FastAPI backend for user:', userId);
  console.log('🔍 INVENTORY SERVICE: Expecting 500+ diamonds from your backend');
  
  const debugInfo = { 
    step: 'Starting inventory fetch from your FastAPI backend', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'mazalbot_fastapi_backend',
    apiUrl: apiEndpoints.getAllStones(userId),
    expectedBackend: 'https://api.mazalbot.com'
  };
  
  try {
    console.log('📡 INVENTORY SERVICE: Calling your FastAPI endpoint:', apiEndpoints.getAllStones(userId));
    console.log('📡 INVENTORY SERVICE: This should return your 500+ real diamonds');
    
    const response = await api.get<any[]>(apiEndpoints.getAllStones(userId));
    
    if (response.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI error:', response.error);
      throw new Error(`FastAPI Error: ${response.error}`);
    }
    
    if (response.data && response.data.length > 0) {
      console.log('✅ INVENTORY SERVICE: SUCCESS! FastAPI returned', response.data.length, 'diamonds from your backend');
      console.log('✅ INVENTORY SERVICE: Your real diamond inventory is now loaded');
      
      return {
        data: response.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real diamonds loaded from your FastAPI backend',
          totalDiamonds: response.data.length,
          dataSource: 'mazalbot_fastapi_backend',
          sampleData: response.data.slice(0, 2) // First 2 items for debugging
        }
      };
    } else {
      console.warn('⚠️ INVENTORY SERVICE: FastAPI returned empty data - check your database');
      throw new Error('No diamonds found in FastAPI response - check your backend database');
    }
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Failed to connect to your FastAPI backend:", error);
    console.error("❌ INVENTORY SERVICE: Your 500+ diamonds are not accessible");
    
    // Fallback to mock data only if FastAPI is completely unreachable
    console.log('🔄 INVENTORY SERVICE: Using mock data as emergency fallback');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data (your FastAPI backend is unreachable)',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_emergency_fallback',
        note: 'Your real 500+ diamonds are not loading - check FastAPI backend connection'
      },
      error: `FastAPI Backend Connection Failed: ${error instanceof Error ? error.message : String(error)}. Using sample data. Please check if your backend at https://api.mazalbot.com is running.`
    };
  }
}
