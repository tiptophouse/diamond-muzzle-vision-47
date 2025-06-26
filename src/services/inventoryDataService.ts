
import { getCurrentUserId, getAccessToken } from "@/lib/api/config";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const telegramUserId = getCurrentUserId();
  const accessToken = getAccessToken();
  
  console.log('🔍 INVENTORY SERVICE: Fetching data from FastAPI v1 get_all_stones endpoint');
  console.log('🔍 INVENTORY SERVICE: Current Telegram user ID:', telegramUserId);
  console.log('🔍 INVENTORY SERVICE: Access token available:', !!accessToken);
  
  const debugInfo = { 
    step: 'Starting inventory fetch with FastAPI v1 get_all_stones endpoint', 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi_v1',
    authentication: 'Bearer Token (Dynamic)',
    telegramUserId: telegramUserId,
    endpoint: '/api/v1/get_all_stones',
    tokenAvailable: !!accessToken
  };
  
  try {
    // Check if we have authentication
    if (!accessToken) {
      console.error('❌ INVENTORY SERVICE: No access token available');
      return {
        error: 'Authentication required. Please refresh the app to authenticate.',
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: No access token available',
          error: 'Missing authentication token'
        }
      };
    }

    // Test backend connectivity first
    console.log('🚀 INVENTORY SERVICE: Testing backend connectivity...');
    const aliveResponse = await fetch('https://api.mazalbot.com/api/v1/alive', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
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
    
    // Use the correct FastAPI v1 get_all_stones endpoint with dynamic Bearer token
    const endpoint = 'https://api.mazalbot.com/api/v1/get_all_stones';
    console.log('🚀 INVENTORY SERVICE: Using get_all_stones endpoint:', endpoint);
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add Telegram user ID for data isolation
    if (telegramUserId) {
      headers['X-Telegram-User-ID'] = telegramUserId.toString();
    }
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });
    
    console.log('📡 INVENTORY SERVICE: Response status:', response.status);
    console.log('📡 INVENTORY SERVICE: Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ INVENTORY SERVICE: FastAPI request failed:', response.status, response.statusText);
      console.error('❌ INVENTORY SERVICE: Error response:', errorText);
      
      let errorMessage = `Failed to fetch stones from get_all_stones: ${response.status} ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Authentication expired. Please refresh the app to re-authenticate.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Please check your permissions.';
      }
      
      return {
        error: errorMessage,
        debugInfo: {
          ...debugInfo,
          step: 'FAILED: get_all_stones request error',
          error: `${response.status}: ${response.statusText}`,
          errorResponse: errorText,
          endpoint
        }
      };
    }
    
    const result = await response.json();
    console.log('📡 INVENTORY SERVICE: Raw response received:', typeof result, Array.isArray(result));
    
    if (result) {
      let stones = [];
      
      // Handle different response formats
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
        } else if (Array.isArray(result.inventory)) {
          stones = result.inventory;
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
        console.log('📊 INVENTORY SERVICE: No stones found in response');
        return {
          data: [],
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Connected to get_all_stones but no stones found',
            totalStones: 0,
            endpoint,
            rawResponse: result
          }
        };
      }
      
      // Process and validate stones data
      const processedStones = stones.filter(stone => stone && typeof stone === 'object').map((stone, index) => {
        return {
          ...stone,
          id: stone.id || stone.stone_id || stone.diamond_id || `stone-${index}-${Date.now()}`,
          stock_number: stone.stock_number || stone.stockNumber || stone.stock_no || `STOCK-${index + 1}`,
          shape: stone.shape || 'Round',
          weight: parseFloat(stone.weight || stone.carat || stone.size || 0),
          color: stone.color || 'D',
          clarity: stone.clarity || 'FL',
          cut: stone.cut || 'Excellent',
          price: parseFloat(stone.price || stone.price_per_carat || 0),
          status: stone.status || 'Available',
          store_visible: stone.store_visible !== false,
          picture: stone.picture || stone.image || stone.imageUrl,
          certificate_url: stone.certificate_url || stone.certificateUrl,
          certificate_number: stone.certificate_number || stone.certificateNumber,
          lab: stone.lab || stone.laboratory
        };
      });
      
      console.log('✅ INVENTORY SERVICE: Processed', processedStones.length, 'valid stones from get_all_stones');
      console.log('✅ INVENTORY SERVICE: Sample processed stone:', processedStones[0]);
      
      return {
        data: processedStones,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data fetched and processed from get_all_stones',
          totalStones: processedStones.length,
          endpoint,
          sampleStone: processedStones[0]
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: No data in get_all_stones response');
    return {
      error: 'No data received from get_all_stones endpoint',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Empty response from get_all_stones',
        endpoint
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Unexpected error calling get_all_stones:", error);
    
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred calling get_all_stones',
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Unexpected error calling get_all_stones',
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
