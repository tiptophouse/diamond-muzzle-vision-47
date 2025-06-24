
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
    step: 'Starting inventory fetch from FastAPI endpoint', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi'
  };
  
  try {
    // Fetch from correct FastAPI endpoint - /get_all_stones
    console.log('🚀 INVENTORY SERVICE: Connecting to FastAPI backend at:', 'https://api.mazalbot.com');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 INVENTORY SERVICE: Using CORRECTED endpoint:', endpoint);
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
      
      // Enhanced data processing for your specific API response format
      let stones = [];
      
      if (Array.isArray(result.data)) {
        // Direct array response
        stones = result.data;
        console.log('✅ INVENTORY SERVICE: Direct array response with', stones.length, 'stones');
      } else if (result.data && typeof result.data === 'object' && result.data !== null) {
        // Object response - check for common property names from your API
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
        } else if (Array.isArray(responseData.inventory)) {
          stones = responseData.inventory;
          console.log('✅ INVENTORY SERVICE: Found inventory array with', stones.length, 'items');
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
            responseKeys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : [],
            apiResponse: result.data
          }
        };
      }
      
      // Enhanced data validation and processing
      const processedStones = stones.filter(stone => stone && typeof stone === 'object').map(stone => {
        // Ensure all required fields are present with fallbacks
        return {
          ...stone,
          id: stone.id || stone.diamond_id || `${stone.stock_number || Date.now()}`,
          stock_number: stone.stock_number || stone.stockNumber || 'N/A',
          shape: stone.shape || 'Round',
          weight: parseFloat(stone.weight || stone.carat || 0),
          color: stone.color || 'D',
          clarity: stone.clarity || 'FL',
          cut: stone.cut || 'Excellent',
          price: parseFloat(stone.price || stone.price_per_carat || 0),
          status: stone.status || 'Available',
          store_visible: stone.store_visible !== false
        };
      });
      
      console.log('✅ INVENTORY SERVICE: Processed', processedStones.length, 'valid stones');
      
      return {
        data: processedStones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real-time FastAPI data fetched and processed',
          totalStones: processedStones.length,
          dataSource: 'fastapi',
          endpoint,
          sampleStone: processedStones[0],
          responseStructure: result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'direct_array',
          processingSuccess: true
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: FastAPI returned invalid data format');
    return {
      error: 'Invalid data format from FastAPI endpoint',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Invalid data format from endpoint',
        receivedData: typeof result.data,
        endpoint
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI connection failed:", error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown FastAPI error',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: FastAPI connection error',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'none'
      }
    };
  }
}
