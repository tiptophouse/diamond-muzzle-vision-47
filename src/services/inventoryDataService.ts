
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Starting fetch with user ID:', userId);
  console.log('🔍 INVENTORY SERVICE: Backend URL:', 'https://api.mazalbot.com');
  console.log('🔍 INVENTORY SERVICE: Expected diamonds: 566');
  
  const debugInfo = { 
    step: 'Starting fetch', 
    userId, 
    expectedCount: 566, 
    timestamp: new Date().toISOString() 
  };
  
  try {
    console.log('🔍 INVENTORY SERVICE: Using API client to fetch data');
    const endpoint = apiEndpoints.getAllStones(userId);
    const fullUrl = `https://api.mazalbot.com${endpoint}`;
    console.log('🔍 INVENTORY SERVICE: Full endpoint URL:', fullUrl);
    console.log('🔍 INVENTORY SERVICE: Expected format: GET https://api.mazalbot.com/api/v1/get_all_stones?user_id=' + userId);
    
    const result = await api.get(endpoint);
    
    const updatedDebugInfo = { 
      ...debugInfo,
      step: 'API call completed',
      hasError: !!result.error,
      hasData: !!result.data,
      endpoint: endpoint,
      fullUrl: fullUrl,
      timestamp: new Date().toISOString()
    };
    
    if (result.error) {
      console.error('🔍 INVENTORY SERVICE: API error:', result.error);
      
      // Try alternative endpoint if the first one fails
      console.log('🔍 INVENTORY SERVICE: Trying alternative endpoint without /api/v1 prefix...');
      try {
        const alternativeEndpoint = `/get_all_stones?user_id=${userId}`;
        console.log('🔍 INVENTORY SERVICE: Alternative endpoint:', `https://api.mazalbot.com${alternativeEndpoint}`);
        const alternativeResult = await api.get(alternativeEndpoint);
        
        if (!alternativeResult.error && alternativeResult.data) {
          console.log('🔍 INVENTORY SERVICE: Alternative endpoint worked!');
          return {
            data: Array.isArray(alternativeResult.data) ? alternativeResult.data : [],
            debugInfo: {
              ...updatedDebugInfo,
              step: 'SUCCESS: Alternative endpoint worked',
              endpoint: alternativeEndpoint,
            }
          };
        }
      } catch (altError) {
        console.error('🔍 INVENTORY SERVICE: Alternative endpoint also failed:', altError);
      }
      
      return {
        data: [],
        error: result.error,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'API error occurred',
          error: result.error,
        }
      };
    }
    
    if (!result.data) {
      console.log('🔍 INVENTORY SERVICE: No data returned from backend');
      return {
        data: [],
        error: 'No data returned from backend',
        debugInfo: {
          ...updatedDebugInfo,
          step: 'No data returned from backend',
        }
      };
    }
    
    // Process the response data with proper type checking
    let dataArray: any[] = [];
    
    if (Array.isArray(result.data)) {
      dataArray = result.data;
    } else if (typeof result.data === 'object' && result.data !== null) {
      // Check for common data structure patterns
      const dataObj = result.data as Record<string, any>;
      if (Array.isArray(dataObj.data)) {
        dataArray = dataObj.data;
      } else if (Array.isArray(dataObj.diamonds)) {
        dataArray = dataObj.diamonds;
      } else if (Array.isArray(dataObj.items)) {
        dataArray = dataObj.items;
      } else if (Array.isArray(dataObj.stones)) {
        dataArray = dataObj.stones;
      }
    }
    
    console.log('🔍 INVENTORY SERVICE: Processing response data:', {
      rawDataType: typeof result.data,
      isArray: Array.isArray(result.data),
      dataArrayLength: dataArray.length,
      expectedLength: 566,
      sampleItem: dataArray[0]
    });
    
    if (dataArray && dataArray.length > 0) {
      console.log('🔍 INVENTORY SERVICE: SUCCESS! Processing', dataArray.length, 'diamonds (expected 566)');
      
      return {
        data: dataArray,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'SUCCESS: Data fetched',
          totalDiamonds: dataArray.length,
          expectedDiamonds: 566,
          backendResponse: dataArray.length,
          sampleItem: dataArray[0],
        }
      };
    } else {
      console.log('🔍 INVENTORY SERVICE: Backend responded but no diamonds found in data');
      console.log('🔍 INVENTORY SERVICE: Response structure:', result.data);
      
      return {
        data: [],
        error: 'No diamonds found in response',
        debugInfo: {
          ...updatedDebugInfo,
          step: 'Backend responded but no diamonds found',
          responseStructure: result.data && typeof result.data === 'object' ? Object.keys(result.data) : [],
          fullResponse: result.data,
        }
      };
    }
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: Critical error connecting to backend:", error);
    
    return {
      data: [],
      error: error instanceof Error ? error.message : String(error),
      debugInfo: {
        ...debugInfo,
        step: 'Critical backend connection error',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      }
    };
  }
}
