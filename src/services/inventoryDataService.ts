import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any; // Accept array or wrapped object from FastAPI
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
        recommendation: 'User must authenticate with Telegram first. Check Telegram WebApp initData.'
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
    
    // Add pagination for large inventories (>5000 diamonds load in batches)
    const endpoint = apiEndpoints.getAllStones(userId, 10000, 0); // Fetch up to 10k diamonds
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
    
    const responseData = (result as any).data;

    if (Array.isArray(responseData)) {
      console.log('✅ INVENTORY SERVICE: Successfully fetched', responseData.length, 'diamonds from FastAPI');

      if (responseData.length >= 10000) {
        console.warn('⚠️ INVENTORY SERVICE: User has 10,000+ diamonds. Some diamonds may not be visible. Consider pagination.');
      }

      if (responseData.length > 0) {
        const sampleItem = responseData[0];
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
        data: responseData,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: FastAPI data received',
          totalDiamonds: responseData.length,
          endpoint,
          imageFieldsFound: responseData.length > 0 ? Object.keys(responseData[0]).filter(key =>
            key.toLowerCase().includes('image') ||
            key.toLowerCase().includes('picture') ||
            key.toLowerCase().includes('photo')
          ) : []
        }
      };
    }

    // Pass through wrapped objects so the hook can unwrap different shapes
    if (responseData && typeof responseData === 'object') {
      console.log('ℹ️ INVENTORY SERVICE: Received wrapped response object from FastAPI');
      return {
        data: responseData,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: FastAPI returned wrapped object',
          totalDiamonds: Array.isArray((responseData as any).data) ? (responseData as any).data.length : undefined,
          endpoint
        }
      };
    }

    console.log('⚠️ INVENTORY SERVICE: FastAPI returned empty data');
    return {
      data: [],
      debugInfo: {
        ...debugInfo,
        step: 'SUCCESS: FastAPI returned empty data',
        totalDiamonds: 0
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: FastAPI request failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's an authentication error
    const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                        errorMessage.toLowerCase().includes('401') ||
                        errorMessage.toLowerCase().includes('403') ||
                        errorMessage.toLowerCase().includes('unauthorized');
    
    return {
      error: isAuthError 
        ? `Authentication failed. Please log in with Telegram to view your inventory.`
        : `Failed to load inventory from FastAPI: ${errorMessage}`,
      debugInfo: {
        ...debugInfo,
        step: 'ERROR: FastAPI request failed',
        error: errorMessage,
        isAuthError,
        recommendation: isAuthError 
          ? 'User needs to authenticate via Telegram WebApp. Check initData availability.'
          : 'Check FastAPI backend connectivity and authentication'
      }
    };
  }
}