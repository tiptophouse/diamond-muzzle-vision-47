
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching REAL-TIME data from FastAPI for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch from new FastAPI endpoint', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi'
  };
  
  try {
    // Fetch from new FastAPI endpoint - /api/v1/get_user_stones
    console.log('🚀 INVENTORY SERVICE: Connecting to FastAPI backend at:', 'https://api.mazalbot.com');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 INVENTORY SERVICE: Using NEW endpoint:', endpoint);
    console.log('🚀 INVENTORY SERVICE: Full URL will be:', `https://api.mazalbot.com${endpoint}`);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', result.error);
      return {
        error: `FastAPI Connection Failed: ${result.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: FastAPI connection error',
          error: result.error,
          endpoint,
          fullUrl: `https://api.mazalbot.com${endpoint}`
        }
      };
    }
    
    if (result.data) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned data:', typeof result.data, Array.isArray(result.data));
      console.log('✅ INVENTORY SERVICE: Raw response structure:', result.data);
      
      // Handle the new endpoint response format
      let stones = [];
      
      if (Array.isArray(result.data)) {
        // Direct array response
        stones = result.data;
        console.log('✅ INVENTORY SERVICE: Direct array response with', stones.length, 'stones');
      } else if (result.data && typeof result.data === 'object' && result.data !== null) {
        // Object response - check for common property names
        const responseData = result.data as Record<string, any>;
        
        if (Array.isArray(responseData.stones)) {
          stones = responseData.stones;
          console.log('✅ INVENTORY SERVICE: Found stones array with', stones.length, 'items');
        } else if (Array.isArray(responseData.data)) {
          stones = responseData.data;
          console.log('✅ INVENTORY SERVICE: Found data array with', stones.length, 'items');
        } else if (Array.isArray(responseData.diamonds)) {
          stones = responseData.diamonds;
          console.log('✅ INVENTORY SERVICE: Found diamonds array with', stones.length, 'items');
        } else {
          // Try to extract any array from the object
          const possibleArrays = Object.values(responseData).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            stones = possibleArrays[0];
            console.log('✅ INVENTORY SERVICE: Found array in response with', stones.length, 'items');
          }
        }
      }
      
      console.log('✅ INVENTORY SERVICE: Final processed stones count:', stones.length);
      
      if (stones.length === 0) {
        console.log('📊 INVENTORY SERVICE: No stones found in your FastAPI database for user:', userId);
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI connected but no stones found',
            totalStones: 0,
            dataSource: 'fastapi',
            endpoint,
            rawResponseType: typeof result.data,
            isArray: Array.isArray(result.data),
            responseKeys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : []
          }
        };
      }
      
      return {
        data: stones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real-time FastAPI data fetched from new endpoint',
          totalStones: stones.length,
          dataSource: 'fastapi',
          endpoint,
          sampleStone: stones[0],
          responseStructure: result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'direct_array'
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: FastAPI returned invalid data format');
    return {
      error: 'Invalid data format from FastAPI new endpoint',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Invalid data format from new endpoint',
        receivedData: typeof result.data,
        endpoint
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI connection failed for new endpoint:", error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown FastAPI error with new endpoint',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: FastAPI connection error with new endpoint',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'none'
      }
    };
  }
}
