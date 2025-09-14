import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('❌ INVENTORY SERVICE: No authenticated user ID available');
    return {
      error: 'Authentication required. Please authenticate with Telegram to view your inventory.',
      debugInfo: {
        step: 'ERROR: No authenticated user',
        userId: null,
        timestamp: new Date().toISOString(),
        dataSource: 'none',
        recommendation: 'User must authenticate with Telegram first'
      }
    };
  }

  console.log('🔍 INVENTORY SERVICE: Fetching data for user:', userId);
  
  const debugInfo = { 
    step: 'Starting FastAPI inventory fetch', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'fastapi'
  };

  try {
    // ONLY use FastAPI - no cache, no localStorage fallbacks
    console.log('🔍 INVENTORY SERVICE: Calling FastAPI get_all_stones endpoint...');
    
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY SERVICE: FastAPI returned error:', result.error);
      return {
        error: result.error,
        debugInfo: {
          ...debugInfo,
          step: 'ERROR: FastAPI returned error',
          error: result.error
        }
      };
    }
    
    if (result.data && Array.isArray(result.data)) {
      console.log('✅ INVENTORY SERVICE: Successfully fetched', result.data.length, 'diamonds from FastAPI');
      
      // Log image fields available in FastAPI response
      if (result.data.length > 0) {
        const sampleItem = result.data[0];
        console.log('📸 INVENTORY SERVICE: Available image fields in FastAPI response:', {
          picture: sampleItem.picture,
          image_url: sampleItem.image_url,
          imageUrl: sampleItem.imageUrl,
          Image: sampleItem.Image,
          image: sampleItem.image,
          photo_url: sampleItem.photo_url,
          diamond_image: sampleItem.diamond_image,
          allImageFields: Object.keys(sampleItem).filter(key => 
            key.toLowerCase().includes('image') || 
            key.toLowerCase().includes('picture') || 
            key.toLowerCase().includes('photo')
          )
        });
      }
      
      return {
        data: result.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: FastAPI data received',
          totalDiamonds: result.data.length,
          endpoint: endpoint,
          imageFieldsFound: result.data.length > 0 ? Object.keys(result.data[0]).filter(key => 
            key.toLowerCase().includes('image') || 
            key.toLowerCase().includes('picture') || 
            key.toLowerCase().includes('photo')
          ) : []
        }
      };
    } else {
      console.log('⚠️ INVENTORY SERVICE: FastAPI returned empty or invalid data');
      return {
        data: [],
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: FastAPI returned empty data',
          totalDiamonds: 0
        }
      };
    }
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI request failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      error: `Failed to load inventory from FastAPI: ${errorMessage}`,
      debugInfo: {
        ...debugInfo,
        step: 'ERROR: FastAPI request failed',
        error: errorMessage,
        recommendation: 'Check FastAPI backend connectivity and authentication'
      }
    };
  }
}