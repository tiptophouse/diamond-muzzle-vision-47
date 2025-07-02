
import { LocalStorageService } from './localStorageService';
import { fetchMockInventoryData } from "./mockInventoryService";
import { getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching data from local storage for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch from local storage', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'localStorage'
  };
  
  try {
    // Get data from local storage
    const result = LocalStorageService.getAllDiamonds();
    
    if (result.success && result.data && result.data.length > 0) {
      console.log('✅ INVENTORY SERVICE: Local storage returned', result.data.length, 'diamonds');
      
      return {
        data: result.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Local storage data fetched',
          totalDiamonds: result.data.length,
          dataSource: 'localStorage'
        }
      };
    }
    
    // If no local data, provide mock data as example
    console.log('🔄 INVENTORY SERVICE: No local data found, providing mock example data');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock example data (no local data found)',
        dataSource: 'mock_example'
      }
    };
    
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: Error occurred:", error);
    
    // Ultimate fallback to mock data
    const mockResult = await fetchMockInventoryData();
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'ERROR FALLBACK: Mock data after local storage error',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_error_fallback'
      }
    };
  }
}
