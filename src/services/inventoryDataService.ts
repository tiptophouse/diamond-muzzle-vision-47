
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching data from FastAPI for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch from FastAPI endpoint', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi'
  };
  
  try {
    // Test backend connectivity first
    console.log('🚀 INVENTORY SERVICE: Testing backend connectivity...');
    const aliveResult = await api.get(apiEndpoints.alive());
    
    if (aliveResult.error) {
      console.error('❌ INVENTORY SERVICE: Backend connectivity test failed:', aliveResult.error);
      return {
        error: `FastAPI server is not responding: ${aliveResult.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: Backend connectivity test failed',
          error: aliveResult.error
        }
      };
    }
    
    console.log('✅ INVENTORY SERVICE: Backend is alive, fetching stones...');
    
    // Fetch from correct FastAPI endpoint
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 INVENTORY SERVICE: Using endpoint:', endpoint);
    console.log('🚀 INVENTORY SERVICE: Full URL:', `https://api.mazalbot.com${endpoint}`);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', result.error);
      return {
        error: `Failed to fetch stones: ${result.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: FastAPI stones request error',
          error: result.error,
          endpoint,
          fullUrl: `https://api.mazalbot.com${endpoint}`
        }
      };
    }
    
    if (result.data) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned data:', typeof result.data, Array.isArray(result.data));
      
      let stones = [];
      
      if (Array.isArray(result.data)) {
        stones = result.data;
        console.log('✅ INVENTORY SERVICE: Direct array response with', stones.length, 'stones');
      } else if (result.data && typeof result.data === 'object') {
        // Handle object response - try common property names
        const responseData = result.data as Record<string, any>;
        
        if (Array.isArray(responseData.stones)) {
          stones = responseData.stones;
        } else if (Array.isArray(responseData.data)) {
          stones = responseData.data;
        } else if (Array.isArray(responseData.diamonds)) {
          stones = responseData.diamonds;
        } else {
          // Try to find any array in the response
          const possibleArrays = Object.values(responseData).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            stones = possibleArrays[0];
          }
        }
        
        console.log('✅ INVENTORY SERVICE: Extracted', stones.length, 'stones from object response');
      }
      
      if (stones.length === 0) {
        console.log('📊 INVENTORY SERVICE: No stones found for user:', userId);
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Connected but no stones found',
            totalStones: 0,
            endpoint,
            responseType: typeof result.data
          }
        };
      }
      
      // Process and validate stones data
      const processedStones = stones.filter(stone => stone && typeof stone === 'object').map(stone => {
        return {
          ...stone,
          id: stone.id || stone.diamond_id || `${stone.stock_number || Date.now()}`,
          stock_number: stone.stock_number || stone.stockNumber || 'N/A',
          shape: stone.shape || 'Round',
          weight: parseFloat(stone.weight || stone.carat || 0),
          color: stone.color || 'D',
          clarity: stone.clarity || 'FL',
          cut: stone.cut || 'Excellent',
          price: parseFloat(stone.price || 0),
          status: stone.status || 'Available',
          store_visible: stone.store_visible !== false
        };
      });
      
      console.log('✅ INVENTORY SERVICE: Processed', processedStones.length, 'valid stones');
      
      return {
        data: processedStones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data fetched and processed',
          totalStones: processedStones.length,
          endpoint,
          sampleStone: processedStones[0]
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: No data in response');
    return {
      error: 'No data received from FastAPI endpoint',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Empty response from endpoint',
        endpoint
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Unexpected error:", error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Unexpected error',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
