
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching real data from FastAPI for user:', userId);
  console.log('🔍 INVENTORY SERVICE: Expected to fetch 500+ diamonds from backend');
  
  const debugInfo = { 
    step: 'Starting FastAPI fetch process', 
    userId, 
    timestamp: new Date().toISOString(),
    expectedDiamonds: '500+',
    dataSource: 'fastapi'
  };
  
  try {
    console.log('🔍 INVENTORY SERVICE: Attempting FastAPI connection to get real inventory');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('🔍 INVENTORY SERVICE: FastAPI failed with error:', result.error);
      console.log('🔍 INVENTORY SERVICE: Falling back to mock data (THIS IS WHY YOU SEE ONLY 5 DIAMONDS)');
      
      return {
        ...await fetchMockInventoryData(),
        debugInfo: {
          ...debugInfo,
          step: 'FALLBACK: FastAPI failed, using mock data',
          reason: result.error,
          actualDiamonds: 5,
          dataSource: 'mock_fallback'
        }
      };
    }
    
    if (!result.data) {
      console.error('🔍 INVENTORY SERVICE: FastAPI returned no data');
      console.log('🔍 INVENTORY SERVICE: This means your 500 diamonds are not being returned by the API');
      
      return {
        ...await fetchMockInventoryData(),
        debugInfo: {
          ...debugInfo,
          step: 'FALLBACK: No data from FastAPI, using mock data',
          reason: 'Empty response from FastAPI',
          actualDiamonds: 5,
          dataSource: 'mock_fallback'
        }
      };
    }
    
    // Process the FastAPI response data more thoroughly
    let dataArray: any[] = [];
    
    if (Array.isArray(result.data)) {
      dataArray = result.data;
      console.log('🔍 INVENTORY SERVICE: Direct array response with', dataArray.length, 'items');
    } else if (typeof result.data === 'object' && result.data !== null) {
      const dataObj = result.data as Record<string, any>;
      
      // Try multiple possible array property names
      const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
      
      for (const key of possibleArrayKeys) {
        if (Array.isArray(dataObj[key])) {
          dataArray = dataObj[key];
          console.log('🔍 INVENTORY SERVICE: Found array in property:', key, 'with', dataArray.length, 'items');
          break;
        }
      }
      
      if (dataArray.length === 0) {
        console.log('🔍 INVENTORY SERVICE: Response structure:', Object.keys(dataObj));
        console.log('🔍 INVENTORY SERVICE: Could not find array data in response');
      }
    }
    
    if (dataArray && dataArray.length > 0) {
      console.log('✅ INVENTORY SERVICE: SUCCESS! FastAPI returned', dataArray.length, 'diamonds (expecting ~500)');
      console.log('🔍 INVENTORY SERVICE: Sample diamond:', dataArray[0]);
      
      if (dataArray.length < 100) {
        console.warn('⚠️ INVENTORY SERVICE: Expected 500+ diamonds but got', dataArray.length, '- check your backend data');
      }
      
      return {
        data: dataArray,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real data fetched from FastAPI',
          totalDiamonds: dataArray.length,
          source: 'fastapi',
          sampleDiamond: dataArray[0],
          dataHealth: dataArray.length >= 100 ? 'good' : 'low_count'
        }
      };
    } else {
      console.error('🔍 INVENTORY SERVICE: FastAPI response processed but no valid array found');
      console.log('🔍 INVENTORY SERVICE: This is why you see mock data instead of your 500 diamonds');
      
      return {
        ...await fetchMockInventoryData(),
        debugInfo: {
          ...debugInfo,
          step: 'FALLBACK: Could not extract array from FastAPI response',
          reason: 'No valid array found in response',
          actualDiamonds: 5,
          dataSource: 'mock_fallback',
          responseStructure: typeof result.data === 'object' ? Object.keys(result.data) : typeof result.data
        }
      };
    }
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: FastAPI connection failed, using mock data fallback:", error);
    console.log("🔍 INVENTORY SERVICE: This is the main reason you're seeing 5 diamonds instead of 500");
    
    // Always return mock data on any error
    return {
      ...await fetchMockInventoryData(),
      debugInfo: {
        ...debugInfo,
        step: 'FALLBACK: FastAPI connection failed',
        error: error instanceof Error ? error.message : String(error),
        actualDiamonds: 5,
        dataSource: 'mock_fallback'
      }
    };
  }
}
