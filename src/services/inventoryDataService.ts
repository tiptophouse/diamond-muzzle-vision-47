
import { getCurrentUserId } from "@/lib/api/config";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const telegramUserId = getCurrentUserId();
  console.log('🔍 INVENTORY SERVICE: Fetching data from FastAPI v1 with Bearer token');
  console.log('🔍 INVENTORY SERVICE: Current Telegram user ID:', telegramUserId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch with FastAPI v1 endpoints', 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi_v1',
    authentication: 'Bearer Token',
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
    // Test backend connectivity using correct endpoint
    console.log('🚀 INVENTORY SERVICE: Testing backend connectivity...');
    const aliveResponse = await fetch('https://api.mazalbot.com/api/v1/alive');
    
    if (!aliveResponse.ok) {
      console.error('❌ INVENTORY SERVICE: Backend connectivity test failed');
      return {
        error: `FastAPI server is not responding: ${aliveResponse.statusText}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: Backend connectivity test failed',
          error: aliveResponse.statusText
        }
      };
    }
    
    console.log('✅ INVENTORY SERVICE: Backend is alive, fetching stones...');
    
    // Use the correct FastAPI v1 endpoint with Bearer token
    const endpoint = 'https://api.mazalbot.com/api/v1/get_all_stones';
    console.log('🚀 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', response.statusText);
      return {
        error: `Failed to fetch stones: ${response.statusText}`,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: FastAPI stones request error',
          error: response.statusText,
          endpoint
        }
      };
    }
    
    const result = await response.json();
    
    if (result) {
      console.log('✅ INVENTORY SERVICE: FastAPI returned data');
      console.log('✅ INVENTORY SERVICE: Response type:', typeof result, 'Is array:', Array.isArray(result));
      
      let stones = [];
      
      if (Array.isArray(result)) {
        stones = result;
        console.log('✅ INVENTORY SERVICE: Direct array response with', stones.length, 'stones');
      } else if (result && typeof result === 'object') {
        // Handle object response - try common property names
        if (Array.isArray(result.stones)) {
          stones = result.stones;
        } else if (Array.isArray(result.data)) {
          stones = result.data;
        } else if (Array.isArray(result.diamonds)) {
          stones = result.diamonds;
        } else {
          // Try to find any array in the response
          const possibleArrays = Object.values(result).filter(value => Array.isArray(value));
          if (possibleArrays.length > 0) {
            stones = possibleArrays[0];
          }
        }
        
        console.log('✅ INVENTORY SERVICE: Extracted', stones.length, 'stones from object response');
      }
      
      if (stones.length === 0) {
        console.log('📊 INVENTORY SERVICE: No stones found');
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Connected but no stones found',
            totalStones: 0,
            endpoint
          }
        };
      }
      
      // Process and validate stones data
      const processedStones = stones.filter(stone => stone && typeof stone === 'object').map(stone => {
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
          store_visible: stone.store_visible !== false
        };
      });
      
      console.log('✅ INVENTORY SERVICE: Processed', processedStones.length, 'valid stones');
      
      return {
        data: processedStones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data fetched and processed',
          totalStones: processedStones.length,
          endpoint,
          sampleStone: processedStones[0]
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: No data in response');
    return {
      error: 'No data received from FastAPI endpoint',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Empty response from endpoint',
        endpoint
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
