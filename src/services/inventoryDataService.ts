
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching real diamonds from FastAPI for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch process', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'unknown',
    endpoint: apiEndpoints.getAllStones(userId)
  };
  
  try {
    // Directly attempt to get data from FastAPI backend
    console.log('🔍 INVENTORY SERVICE: Calling FastAPI get_all_stones endpoint...');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 INVENTORY SERVICE: Full endpoint URL:', endpoint);
    
    const result = await api.get(endpoint);
    console.log('📡 INVENTORY SERVICE: FastAPI response received:', result);
    
    if (result.data && !result.error) {
      let dataArray: any[] = [];
      
      // Handle different response formats from FastAPI
      if (Array.isArray(result.data)) {
        dataArray = result.data;
        console.log('✅ INVENTORY SERVICE: Direct array with', dataArray.length, 'diamonds');
      } else if (typeof result.data === 'object' && result.data !== null) {
        const dataObj = result.data as Record<string, any>;
        console.log('📦 INVENTORY SERVICE: Object response, checking for arrays:', Object.keys(dataObj));
        
        // Check common property names that might contain the diamond array
        const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(dataObj[key])) {
            dataArray = dataObj[key];
            console.log(`✅ INVENTORY SERVICE: Found array in property '${key}' with`, dataArray.length, 'items');
            break;
          }
        }
        
        // If no arrays found, log the structure for debugging
        if (dataArray.length === 0) {
          console.log('🔍 INVENTORY SERVICE: Response structure:', {
            keys: Object.keys(dataObj),
            types: Object.keys(dataObj).reduce((acc, key) => ({
              ...acc,
              [key]: typeof dataObj[key]
            }), {})
          });
        }
      }
      
      if (dataArray && dataArray.length > 0) {
        console.log('✅ INVENTORY SERVICE: Successfully fetched', dataArray.length, 'real diamonds from FastAPI');
        console.log('📊 INVENTORY SERVICE: Sample diamond data:', dataArray[0]);
        
        return {
          data: dataArray,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Real diamond data from FastAPI',
            totalDiamonds: dataArray.length,
            dataSource: 'fastapi',
            sampleData: dataArray[0]
          }
        };
      } else {
        console.warn('⚠️ INVENTORY SERVICE: FastAPI returned empty result or no diamonds found');
        return {
          data: [],
          error: 'No diamonds found in your FastAPI database',
          debugInfo: {
            ...debugInfo,
            step: 'FastAPI returned empty result',
            totalDiamonds: 0,
            dataSource: 'fastapi_empty'
          }
        };
      }
    }
    
    // If we get here, there was an error from the API
    const errorMsg = result.error || 'FastAPI returned an error response';
    console.error('❌ INVENTORY SERVICE: FastAPI error:', errorMsg);
    throw new Error(errorMsg);
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI connection failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a network/connection error
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') || 
        errorMessage.includes('not reachable')) {
      
      return {
        data: [],
        error: `Cannot connect to FastAPI server at https://api.mazalbot.com. Please check if your backend server is running and accessible.`,
        debugInfo: {
          ...debugInfo,
          step: 'NETWORK ERROR: FastAPI server unreachable',
          error: errorMessage,
          dataSource: 'connection_failed',
          suggestion: 'Check FastAPI server status and network connectivity'
        }
      };
    }
    
    // For other errors, return the specific error
    return {
      data: [],
      error: `FastAPI Error: ${errorMessage}`,
      debugInfo: {
        ...debugInfo,
        step: 'API ERROR: FastAPI request failed',
        error: errorMessage,
        dataSource: 'api_error'
      }
    };
  }
}
