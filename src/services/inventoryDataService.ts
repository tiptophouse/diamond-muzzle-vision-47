
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

import { standardizeDiamondFormat } from '@/lib/dataConsistency';

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  const debugInfo = { 
    step: 'Starting inventory fetch process', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'unknown'
  };
  
  try {
    // First, try to get data from FastAPI backend
    const endpoint = apiEndpoints.getAllStones(userId);
    
    const result = await api.get(endpoint);
    
    if (result.data && !result.error) {
      let dataArray: any[] = [];
      
      // The FastAPI endpoint should return an array directly
      if (Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (typeof result.data === 'object' && result.data !== null) {
        // Handle if the response is wrapped in an object
        const dataObj = result.data as Record<string, any>;
        const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(dataObj[key])) {
            dataArray = dataObj[key];
            break;
          }
        }
      }
      
      if (dataArray && dataArray.length > 0) {
        // Standardize diamond data format
        const standardizedData = dataArray.map(standardizeDiamondFormat);
        
        return {
          data: standardizedData,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI data fetched',
            totalDiamonds: standardizedData.length,
            dataSource: 'fastapi',
            endpoint: endpoint
          }
        };
      }
    } else {
      // API error - continue to fallbacks
    }
    
    // If FastAPI fails, try localStorage
    const localData = localStorage.getItem('diamond_inventory');
    
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Filter for current user
          const userDiamonds = parsedData.filter(item => 
            !item.user_id || item.user_id === userId
          );
          
          if (userDiamonds.length > 0) {
            return {
              data: userDiamonds,
              debugInfo: {
                ...debugInfo,
                step: 'SUCCESS: localStorage data found',
                totalDiamonds: userDiamonds.length,
                dataSource: 'localStorage'
              }
            };
          }
        }
      } catch (parseError) {
        // Parse error - continue to next fallback
      }
    }
    
    // Final fallback to mock data
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data',
        dataSource: 'mock'
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Error occurred:", error);
    
    // Try localStorage as emergency fallback
    const localData = localStorage.getItem('diamond_inventory');
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData)) {
          const userDiamonds = parsedData.filter(item => 
            !item.user_id || item.user_id === userId
          );
          
          return {
            data: userDiamonds,
            debugInfo: {
              ...debugInfo,
              step: 'EMERGENCY: localStorage fallback after error',
              totalDiamonds: userDiamonds.length,
              dataSource: 'localStorage_emergency'
            }
          };
        }
      } catch (parseError) {
        // Emergency parse error - continue to final fallback
      }
    }
    
    // Ultimate fallback to mock data
    const mockResult = await fetchMockInventoryData();
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'ULTIMATE FALLBACK: Mock data after all failures',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_emergency'
      }
    };
  }
}
