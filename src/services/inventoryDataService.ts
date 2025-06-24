
import { api, apiEndpoints } from "@/lib/api";
import { getCurrentUserId } from "@/lib/api/config";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const telegramUserId = getCurrentUserId();
  console.log('🔍 INVENTORY SERVICE: Fetching data from FastAPI with Telegram user isolation');
  console.log('🔍 INVENTORY SERVICE: Current Telegram user ID:', telegramUserId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch with Telegram user ID filtering', 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi',
    authentication: 'JWT Bearer Token + Telegram ID',
    telegramUserId: telegramUserId
  };
  
  if (!telegramUserId) {
    console.error('❌ INVENTORY SERVICE: No Telegram user ID available for data filtering');
    return {
      error: 'No authenticated Telegram user found. Please restart the app.',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: No Telegram user ID for filtering',
        error: 'Missing Telegram user authentication'
      }
    };
  }
  
  try {
    // Test backend connectivity first
    console.log('🚀 INVENTORY SERVICE: Testing backend connectivity...');
    const aliveResult = await api.get(apiEndpoints.alive());
    
    if (aliveResult.error) {
      console.error('❌ INVENTORY SERVICE: Backend connectivity test failed:', aliveResult.error);
      return {
        error: `FastAPI server is not responding: ${aliveResult.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: Backend connectivity test failed',
          error: aliveResult.error
        }
      };
    }
    
    console.log('✅ INVENTORY SERVICE: Backend is alive, fetching stones for Telegram user:', telegramUserId);
    
    // Fetch from JWT-authenticated endpoint with Telegram user filtering
    const endpoint = apiEndpoints.getAllStones();
    console.log('🚀 INVENTORY SERVICE: Using filtered endpoint:', endpoint);
    console.log('🚀 INVENTORY SERVICE: Full URL:', `https://api.mazalbot.com${endpoint}`);
    console.log('🚀 INVENTORY SERVICE: Backend will filter by Telegram user ID:', telegramUserId);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', result.error);
      return {
        error: `Failed to fetch stones for your account: ${result.error}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: FastAPI stones request error',
          error: result.error,
          endpoint,
          fullUrl: `https://api.mazalbot.com${endpoint}`,
          telegramUserId
        }
      };
    }
    
    if (result.data) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned filtered data for Telegram user:', telegramUserId);
      console.log('✅ INVENTORY SERVICE: Response type:', typeof result.data, 'Is array:', Array.isArray(result.data));
      
      let stones = [];
      
      if (Array.isArray(result.data)) {
        stones = result.data;
        console.log('✅ INVENTORY SERVICE: Direct array response with', stones.length, 'stones for user:', telegramUserId);
      } else if (result.data && typeof result.data === 'object') {
        // Handle object response - try common property names
        const responseData = result.data as Record<string, any>;
        
        if (Array.isArray(responseData.stones)) {
          stones = responseData.stones;
        } else if (Array.isArray(responseData.data)) {
          stones = responseData.data;
        } else if (Array.isArray(responseData.diamonds)) {
          stones = responseData.diamonds;
        } else {
          // Try to find any array in the response
          const possibleArrays = Object.values(responseData).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            stones = possibleArrays[0];
          }
        }
        
        console.log('✅ INVENTORY SERVICE: Extracted', stones.length, 'stones from object response for user:', telegramUserId);
      }
      
      if (stones.length === 0) {
        console.log('📊 INVENTORY SERVICE: No stones found for authenticated Telegram user:', telegramUserId);
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Connected but no stones found for this user',
            totalStones: 0,
            endpoint,
            responseType: typeof result.data,
            telegramUserId
          }
        };
      }
      
      // Process and validate stones data with user verification
      const processedStones = stones.filter(stone => stone && typeof stone === 'object').map(stone => {
        // Log any user_id mismatch for debugging
        if (stone.user_id && stone.user_id !== telegramUserId) {
          console.warn('⚠️ INVENTORY SERVICE: Stone user_id mismatch:', stone.user_id, 'vs current user:', telegramUserId);
        }
        
        return {
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
          user_id: stone.user_id || telegramUserId // Ensure user_id is set
        };
      });
      
      console.log('✅ INVENTORY SERVICE: Processed', processedStones.length, 'valid stones for Telegram user:', telegramUserId);
      
      return {
        data: processedStones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data fetched and processed with Telegram user filtering',
          totalStones: processedStones.length,
          endpoint,
          sampleStone: processedStones[0],
          telegramUserId
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: No data in response for Telegram user:', telegramUserId);
    return {
      error: 'No data received from FastAPI endpoint for your account',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Empty response from endpoint',
        endpoint,
        telegramUserId
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Unexpected error for Telegram user:", telegramUserId, error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Unexpected error',
        error: error instanceof Error ? error.message : String(error),
        telegramUserId
      }
    };
  }
}
