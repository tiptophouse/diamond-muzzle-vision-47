
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching data for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch process', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'unknown'
  };
  
  try {
    // First, try to get data from FastAPI backend using get_all_stones
    console.log('🔍 INVENTORY SERVICE: Attempting FastAPI connection...');
    
    // Add timeout and error boundary around API call
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    // Wrap API call with comprehensive error handling
    let result;
    try {
      result = await Promise.race([
        api.get(endpoint),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 10000)
        )
      ]) as any;
    } catch (apiError) {
      console.error('❌ INVENTORY SERVICE: FastAPI call failed:', apiError);
      throw apiError;
    }
    
    if (result.data && !result.error) {
      let dataArray: any[] = [];
      
      // The FastAPI endpoint should return an array directly
      if (Array.isArray(result.data)) {
        dataArray = result.data;
        console.log('✅ INVENTORY SERVICE: FastAPI returned array with', dataArray.length, 'diamonds');
      } else if (typeof result.data === 'object' && result.data !== null) {
        // Handle if the response is wrapped in an object
        const dataObj = result.data as Record<string, any>;
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
        console.log('✅ INVENTORY SERVICE: Successfully fetched', dataArray.length, 'diamonds from FastAPI');
        
        // Log EXACTLY what FastAPI is sending for debugging
        console.log('🚨 FASTAPI RESPONSE ANALYSIS:', {
          totalCount: dataArray.length,
          firstItem: {
            id: dataArray[0].id,
            stock_number: dataArray[0].stock_number,
            stock: dataArray[0].stock,
            picture: dataArray[0].picture,
            Image: dataArray[0].Image,
            image: dataArray[0].image,
            imageUrl: dataArray[0].imageUrl,
            photo_url: dataArray[0].photo_url,
            diamond_image: dataArray[0].diamond_image,
            'Video link': dataArray[0]['Video link'],
            videoLink: dataArray[0].videoLink,
            video_url: dataArray[0].video_url,
            gem360Url: dataArray[0].gem360Url,
            v360_url: dataArray[0].v360_url,
            allFields: Object.keys(dataArray[0]).sort()
          },
          imageFieldsFound: Object.keys(dataArray[0]).filter(key => 
            key.toLowerCase().includes('image') || 
            key.toLowerCase().includes('picture') || 
            key.toLowerCase().includes('photo') ||
            key.toLowerCase().includes('img')
          ),
          videoFieldsFound: Object.keys(dataArray[0]).filter(key => 
            key.toLowerCase().includes('video') || 
            key.toLowerCase().includes('360') || 
            key.toLowerCase().includes('3d') ||
            key.toLowerCase().includes('viewer')
          ),
          sampleImageValues: {
            picture: dataArray[0].picture,
            Image: dataArray[0].Image,
            imageUrl: dataArray[0].imageUrl,
            photo_url: dataArray[0].photo_url
          }
        });
        console.log('📊 INVENTORY SERVICE: Sample diamond data:', dataArray[0]);
        
        return {
          data: dataArray,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI data fetched',
            totalDiamonds: dataArray.length,
            dataSource: 'fastapi',
            endpoint: endpoint
          }
        };
      } else {
        console.log('⚠️ INVENTORY SERVICE: FastAPI returned empty result');
      }
    } else {
      console.log('❌ INVENTORY SERVICE: FastAPI returned error:', result.error);
    }
    
    // If FastAPI fails, try localStorage
    console.log('🔄 INVENTORY SERVICE: FastAPI failed, checking localStorage...');
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
            console.log('✅ INVENTORY SERVICE: Found', userDiamonds.length, 'diamonds in localStorage');
            
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
        console.warn('❌ INVENTORY SERVICE: Failed to parse localStorage data:', parseError);
      }
    }
    
    // Return error instead of mock data - clients should not see mock data
    console.log('❌ INVENTORY SERVICE: No real data found - returning error instead of mock data');
    
    return {
      error: 'No inventory data available. Please ensure your FastAPI backend is running and accessible.',
      debugInfo: {
        ...debugInfo,
        step: 'ERROR: No real data available',
        dataSource: 'none',
        recommendation: 'Check FastAPI backend connectivity'
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
        console.warn('❌ INVENTORY SERVICE: Emergency localStorage parse failed:', parseError);
      }
    }
    
    // Return error instead of mock data - clients should not see mock data
    return {
      error: error instanceof Error ? error.message : String(error),
      debugInfo: {
        ...debugInfo,
        step: 'ERROR: All data sources failed',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'none',
        recommendation: 'Check authentication and FastAPI backend connectivity'
      }
    };
  }
}
