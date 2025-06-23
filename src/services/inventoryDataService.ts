
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
    // Fetch from FastAPI backend - NO FALLBACK TO MOCK DATA
    console.log('🚀 INVENTORY SERVICE: Connecting to FastAPI...');
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🚀 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', result.error);
      return {
        error: `FastAPI Connection Failed: ${result.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: FastAPI connection error',
          error: result.error,
          endpoint
        }
      };
    }
    
    if (result.data && Array.isArray(result.data)) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned', result.data.length, 'diamonds');
      
      if (result.data.length === 0) {
        console.log('📊 INVENTORY SERVICE: No diamonds found in your database');
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI connected but no diamonds found',
            totalDiamonds: 0,
            dataSource: 'fastapi',
            endpoint
          }
        };
      }
      
      return {
        data: result.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Real-time FastAPI data fetched',
          totalDiamonds: result.data.length,
          dataSource: 'fastapi',
          endpoint
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
