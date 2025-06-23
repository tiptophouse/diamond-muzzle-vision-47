
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  // Get the current user ID from API config
  let userId = getCurrentUserId();
  
  // If no user ID is set, use admin ID as fallback
  if (!userId) {
    console.warn('⚠️ INVENTORY SERVICE: No user ID found in API config, using admin fallback');
    userId = 2138564172; // Your admin ID
  }
  
  console.log('🔍 INVENTORY SERVICE: Fetching diamonds for user ID:', userId, 'type:', typeof userId);
  console.log('🔍 INVENTORY SERVICE: Building API endpoint with user_id parameter');
  
  const debugInfo = { 
    step: 'Starting inventory fetch from FastAPI backend', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'mazalbot_fastapi_backend',
    apiUrl: apiEndpoints.getAllStones(userId),
    expectedBackend: 'https://api.mazalbot.com'
  };
  
  try {
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('📡 INVENTORY SERVICE: Calling FastAPI endpoint:', endpoint);
    console.log('📡 INVENTORY SERVICE: Full URL will be: https://api.mazalbot.com' + endpoint);
    
    const response = await api.get<any[]>(endpoint);
    
    if (response.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI error:', response.error);
      throw new Error(`FastAPI Error: ${response.error}`);
    }
    
    if (response.data && response.data.length > 0) {
      console.log('✅ INVENTORY SERVICE: SUCCESS! FastAPI returned', response.data.length, 'diamonds');
      console.log('✅ INVENTORY SERVICE: Your real diamond inventory is now loaded');
      console.log('📊 INVENTORY SERVICE: Sample diamonds:', response.data.slice(0, 2));
      
      return {
        data: response.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real diamonds loaded from FastAPI backend',
          totalDiamonds: response.data.length,
          dataSource: 'mazalbot_fastapi_backend',
          sampleData: response.data.slice(0, 2)
        }
      };
    } else {
      console.warn('⚠️ INVENTORY SERVICE: FastAPI returned empty data');
      throw new Error('No diamonds found in FastAPI response - check your backend database');
    }
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Failed to fetch from FastAPI backend:", error);
    console.error("❌ INVENTORY SERVICE: API call failed, falling back to mock data");
    
    // Fallback to mock data only if FastAPI is completely unreachable
    console.log('🔄 INVENTORY SERVICE: Using mock data as emergency fallback');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data (FastAPI backend failed)',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_emergency_fallback',
        note: 'Your real diamonds failed to load - check FastAPI backend connection'
      },
      error: `FastAPI Backend Error: ${error instanceof Error ? error.message : String(error)}. Using sample data. Please check if your backend at https://api.mazalbot.com is running.`
    };
  }
}
