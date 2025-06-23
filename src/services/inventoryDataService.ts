
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
    step: 'Starting inventory fetch from FastAPI', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi'
  };
  
  try {
    // Fetch from FastAPI backend - REAL DATA ONLY
    console.log('🚀 INVENTORY SERVICE: Connecting to FastAPI backend at:', 'https://api.mazalbot.com');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 INVENTORY SERVICE: Using endpoint:', endpoint);
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
      console.log('✅ INVENTORY SERVICE: Raw response:', result.data);
      
      // Handle different response formats with proper type checking
      let diamonds = [];
      if (Array.isArray(result.data)) {
        diamonds = result.data;
      } else if (result.data && typeof result.data === 'object' && result.data !== null) {
        // Check if the response has a diamonds property
        const responseData = result.data as Record<string, any>;
        if (Array.isArray(responseData.diamonds)) {
          diamonds = responseData.diamonds;
        } else {
          // If it's an object, try to extract diamond data
          diamonds = Object.values(responseData).filter(item => 
            item && typeof item === 'object' && (item.stock_number || item.weight)
          );
        }
      }
      
      console.log('✅ INVENTORY SERVICE: Processed diamonds count:', diamonds.length);
      
      if (diamonds.length === 0) {
        console.log('📊 INVENTORY SERVICE: No diamonds found in your FastAPI database');
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI connected but no diamonds found',
            totalDiamonds: 0,
            dataSource: 'fastapi',
            endpoint,
            rawResponseType: typeof result.data,
            isArray: Array.isArray(result.data)
          }
        };
      }
      
      return {
        data: diamonds,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real-time FastAPI data fetched',
          totalDiamonds: diamonds.length,
          dataSource: 'fastapi',
          endpoint,
          sampleDiamond: diamonds[0]
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: FastAPI returned invalid data format');
    return {
      error: 'Invalid data format from FastAPI',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Invalid data format',
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
