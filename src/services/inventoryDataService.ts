
import { secureApiService } from './secureApiService';
import { getCurrentUserId } from '@/lib/api/config';

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const telegramUserId = getCurrentUserId();
  console.log('🔍 INVENTORY SERVICE: Fetching data with secure API for user:', telegramUserId);
  
  const debugInfo = { 
    step: 'Starting secure inventory fetch', 
    timestamp: new Date().toISOString(),
    dataSource: 'secure-fastapi-proxy',
    telegramUserId: telegramUserId
  };
  
  if (!telegramUserId) {
    console.error('❌ INVENTORY SERVICE: No Telegram user ID available');
    return {
      error: 'No authenticated Telegram user found. Please restart the app.',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: No Telegram user ID',
        error: 'Missing Telegram user authentication'
      }
    };
  }
  
  try {
    // Test connection first
    console.log('🚀 INVENTORY SERVICE: Testing secure connection...');
    const aliveResult = await secureApiService.testConnection();
    
    if (!aliveResult.success) {
      console.error('❌ INVENTORY SERVICE: Connection test failed:', aliveResult.error);
      return {
        error: `FastAPI server is not responding: ${aliveResult.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: Connection test failed',
          error: aliveResult.error
        }
      };
    }
    
    console.log('✅ INVENTORY SERVICE: Connection test passed, fetching stones...');
    
    // Fetch stones using secure API
    const result = await secureApiService.getAllStones();
    
    if (!result.success) {
      console.error('❌ INVENTORY SERVICE: Secure API request failed:', result.error);
      return {
        error: `Failed to fetch stones: ${result.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: Secure API request error',
          error: result.error
        }
      };
    }
    
    if (result.data) {
      let stones = [];
      
      if (Array.isArray(result.data)) {
        stones = result.data;
      } else if (result.data && typeof result.data === 'object') {
        // Handle object response - try common property names
        const responseData = result.data as Record<string, any>;
        
        if (Array.isArray(responseData.stones)) {
          stones = responseData.stones;
        } else if (Array.isArray(responseData.data)) {
          stones = responseData.data;
        } else if (Array.isArray(responseData.diamonds)) {
          stones = responseData.diamonds;
        }
      }
      
      console.log('✅ INVENTORY SERVICE: Processed', stones.length, 'stones for user:', telegramUserId);
      
      if (stones.length === 0) {
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Connected but no stones found',
            totalStones: 0
          }
        };
      }
      
      // Process and validate stones data
      const processedStones = stones.filter(stone => stone && typeof stone === 'object').map(stone => ({
        ...stone,
        id: stone.id || stone.diamond_id || `${stone.stock_number || Date.now()}`,
        stock_number: stone.stock_number || stone.stockNumber || 'N/A',
        shape: stone.shape || 'Round',
        weight: parseFloat(stone.weight || stone.carat || 0),
        color: stone.color || 'D',
        clarity: stone.clarity || 'FL',
        cut: stone.cut || 'Excellent',
        price: parseFloat(stone.price || 0),
        status: stone.status || 'Available',
        store_visible: stone.store_visible !== false,
        user_id: stone.user_id || telegramUserId
      }));
      
      return {
        data: processedStones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data fetched with secure API',
          totalStones: processedStones.length
        }
      };
    }
    
    return {
      error: 'No data received from secure API',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Empty response'
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Unexpected error:", error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Unexpected error',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
