
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Starting FastAPI fetch with user ID:', userId);
  console.log('🔍 INVENTORY SERVICE: FastAPI Backend URL:', 'https://api.mazalbot.com');
  console.log('🔍 INVENTORY SERVICE: Expected diamonds from FastAPI: 566');
  
  const debugInfo = { 
    step: 'Starting FastAPI fetch', 
    userId, 
    backendUrl: 'https://api.mazalbot.com',
    expectedCount: 566, 
    timestamp: new Date().toISOString() 
  };
  
  try {
    console.log('🔍 INVENTORY SERVICE: Using FastAPI client to fetch data');
    const endpoint = apiEndpoints.getAllStones(userId);
    const fullUrl = `https://api.mazalbot.com${endpoint}`;
    console.log('🔍 INVENTORY SERVICE: FastAPI endpoint URL:', fullUrl);
    console.log('🔍 INVENTORY SERVICE: Expected format: GET https://api.mazalbot.com/api/v1/get_all_stones?user_id=' + userId);
    
    const result = await api.get(endpoint);
    
    const updatedDebugInfo = { 
      ...debugInfo,
      step: 'FastAPI call completed',
      hasError: !!result.error,
      hasData: !!result.data,
      endpoint: endpoint,
      fullUrl: fullUrl,
      timestamp: new Date().toISOString()
    };
    
    if (result.error) {
      console.error('🔍 INVENTORY SERVICE: FastAPI error:', result.error);
      
      // Try alternative endpoint formats for FastAPI
      console.log('🔍 INVENTORY SERVICE: Trying alternative FastAPI endpoints...');
      
      const alternativeEndpoints = [
        `/get_all_stones?user_id=${userId}`,
        `/stones?user_id=${userId}`,
        `/api/stones?user_id=${userId}`,
        `/diamonds?user_id=${userId}`,
      ];
      
      for (const altEndpoint of alternativeEndpoints) {
        try {
          console.log('🔍 INVENTORY SERVICE: Trying FastAPI endpoint:', `https://api.mazalbot.com${altEndpoint}`);
          const alternativeResult = await api.get(altEndpoint);
          
          if (!alternativeResult.error && alternativeResult.data) {
            console.log('🔍 INVENTORY SERVICE: Alternative FastAPI endpoint worked!');
            return {
              data: Array.isArray(alternativeResult.data) ? alternativeResult.data : [],
              debugInfo: {
                ...updatedDebugInfo,
                step: 'SUCCESS: Alternative FastAPI endpoint worked',
                endpoint: altEndpoint,
              }
            };
          }
        } catch (altError) {
          console.error('🔍 INVENTORY SERVICE: Alternative FastAPI endpoint failed:', altError);
        }
      }
      
      return {
        data: [],
        error: `FastAPI Error: ${result.error}`,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'All FastAPI endpoints failed',
          error: result.error,
        }
      };
    }
    
    if (!result.data) {
      console.log('🔍 INVENTORY SERVICE: No data returned from FastAPI backend');
      return {
        data: [],
        error: 'No data returned from FastAPI backend',
        debugInfo: {
          ...updatedDebugInfo,
          step: 'No data returned from FastAPI backend',
        }
      };
    }
    
    // Process the FastAPI response data
    let dataArray: any[] = [];
    
    if (Array.isArray(result.data)) {
      dataArray = result.data;
    } else if (typeof result.data === 'object' && result.data !== null) {
      // Check for common FastAPI response patterns
      const dataObj = result.data as Record<string, any>;
      if (Array.isArray(dataObj.data)) {
        dataArray = dataObj.data;
      } else if (Array.isArray(dataObj.diamonds)) {
        dataArray = dataObj.diamonds;
      } else if (Array.isArray(dataObj.items)) {
        dataArray = dataObj.items;
      } else if (Array.isArray(dataObj.stones)) {
        dataArray = dataObj.stones;
      } else if (Array.isArray(dataObj.results)) {
        dataArray = dataObj.results;
      }
    }
    
    console.log('🔍 INVENTORY SERVICE: Processing FastAPI response data:', {
      rawDataType: typeof result.data,
      isArray: Array.isArray(result.data),
      dataArrayLength: dataArray.length,
      expectedLength: 566,
      sampleItem: dataArray[0]
    });
    
    if (dataArray && dataArray.length > 0) {
      console.log('🔍 INVENTORY SERVICE: SUCCESS! Processing', dataArray.length, 'diamonds from FastAPI (expected 566)');
      
      return {
        data: dataArray,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'SUCCESS: Data fetched from FastAPI',
          totalDiamonds: dataArray.length,
          expectedDiamonds: 566,
          fastApiResponse: dataArray.length,
          sampleItem: dataArray[0],
        }
      };
    } else {
      console.log('🔍 INVENTORY SERVICE: FastAPI responded but no diamonds found in data');
      console.log('🔍 INVENTORY SERVICE: FastAPI response structure:', result.data);
      
      return {
        data: [],
        error: 'No diamonds found in FastAPI response',
        debugInfo: {
          ...updatedDebugInfo,
          step: 'FastAPI responded but no diamonds found',
          responseStructure: result.data && typeof result.data === 'object' ? Object.keys(result.data) : [],
          fullResponse: result.data,
        }
      };
    }
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: Critical error connecting to FastAPI backend:", error);
    
    return {
      data: [],
      error: error instanceof Error ? error.message : String(error),
      debugInfo: {
        ...debugInfo,
        step: 'Critical FastAPI backend connection error',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      }
    };
  }
}
