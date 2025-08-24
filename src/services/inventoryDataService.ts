
import { secureApiClient } from "@/lib/api/secureClient";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  console.log('🔍 INVENTORY SERVICE: Fetching data using secure API client');
  
  const debugInfo = { 
    step: 'Starting secure inventory fetch process', 
    timestamp: new Date().toISOString(),
    dataSource: 'unknown'
  };
  
  try {
    // Check if authenticated with secure client
    if (!secureApiClient.isAuthenticated()) {
      console.warn('⚠️ INVENTORY SERVICE: Not authenticated with secure client');
      return {
        error: 'Authentication required',
        debugInfo: {
          ...debugInfo,
          step: 'ERROR: Not authenticated',
          dataSource: 'none'
        }
      };
    }

    // Use secure API client to get all stones
    console.log('🔍 INVENTORY SERVICE: Using secure FastAPI connection...');
    const response = await secureApiClient.get('/api/v1/diamonds/');
    
    if (response.success && response.data) {
      let dataArray: any[] = [];
      
      // Handle response format
      if (Array.isArray(response.data)) {
        dataArray = response.data;
        console.log('✅ INVENTORY SERVICE: Secure FastAPI returned array with', dataArray.length, 'diamonds');
      } else if (typeof response.data === 'object' && response.data !== null) {
        const dataObj = response.data as Record<string, any>;
        const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(dataObj[key])) {
            dataArray = dataObj[key];
            console.log('✅ INVENTORY SERVICE: Found array in property:', key, 'with', dataArray.length, 'items');
            break;
          }
        }
      }
      
      if (dataArray && dataArray.length > 0) {
        console.log('✅ INVENTORY SERVICE: Successfully fetched', dataArray.length, 'diamonds from secure FastAPI');
        console.log('📊 INVENTORY SERVICE: Sample diamond data:', dataArray[0]);
        
        return {
          data: dataArray,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Secure FastAPI data fetched',
            totalDiamonds: dataArray.length,
            dataSource: 'secure_fastapi'
          }
        };
      } else {
        console.log('⚠️ INVENTORY SERVICE: Secure FastAPI returned empty result');
      }
    } else {
      console.log('❌ INVENTORY SERVICE: Secure FastAPI returned error:', response.error);
    }
    
    // Fallback to localStorage if secure API fails
    console.log('🔄 INVENTORY SERVICE: Secure FastAPI failed, checking localStorage...');
    const localData = localStorage.getItem('diamond_inventory');
    
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log('✅ INVENTORY SERVICE: Found', parsedData.length, 'diamonds in localStorage');
          
          return {
            data: parsedData,
            debugInfo: {
              ...debugInfo,
              step: 'SUCCESS: localStorage data found',
              totalDiamonds: parsedData.length,
              dataSource: 'localStorage'
            }
          };
        }
      } catch (parseError) {
        console.warn('❌ INVENTORY SERVICE: Failed to parse localStorage data:', parseError);
      }
    }
    
    // Final fallback to mock data
    console.log('🔄 INVENTORY SERVICE: No real data found, using mock data');
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
    
    // Emergency fallback to mock data
    const mockResult = await fetchMockInventoryData();
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'EMERGENCY: Mock data after error',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_emergency'
      }
    };
  }
}
