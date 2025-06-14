
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Starting with FastAPI, fallback to mock data');
  console.log('🔍 INVENTORY SERVICE: User ID:', userId);
  
  const debugInfo = { 
    step: 'Starting fetch process', 
    userId, 
    timestamp: new Date().toISOString() 
  };
  
  try {
    console.log('🔍 INVENTORY SERVICE: Attempting FastAPI connection');
    const endpoint = apiEndpoints.getAllStones(userId);
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.log('🔍 INVENTORY SERVICE: FastAPI failed, using mock data');
      return await fetchMockInventoryData();
    }
    
    if (!result.data) {
      console.log('🔍 INVENTORY SERVICE: No FastAPI data, using mock data');
      return await fetchMockInventoryData();
    }
    
    // Process the FastAPI response data
    let dataArray: any[] = [];
    
    if (Array.isArray(result.data)) {
      dataArray = result.data;
    } else if (typeof result.data === 'object' && result.data !== null) {
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
    
    if (dataArray && dataArray.length > 0) {
      console.log('🔍 INVENTORY SERVICE: SUCCESS! FastAPI returned', dataArray.length, 'diamonds');
      
      return {
        data: dataArray,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data fetched from FastAPI',
          totalDiamonds: dataArray.length,
          source: 'fastapi',
        }
      };
    } else {
      console.log('🔍 INVENTORY SERVICE: FastAPI returned empty data, using mock data');
      return await fetchMockInventoryData();
    }
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: FastAPI error, using mock data fallback:", error);
    
    // Always return mock data on any error
    return await fetchMockInventoryData();
  }
}
