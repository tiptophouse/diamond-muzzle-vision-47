
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
    const endpoint = apiEndpoints.getAllStones(userId);
    console.log('🔍 INVENTORY SERVICE: Using endpoint:', endpoint);
    
    const result = await api.get(endpoint);
    
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
        
        // CRITICAL DEBUGGING: Log exactly what we're getting from FastAPI  
        console.log('🚨 FASTAPI RESPONSE ANALYSIS:', {
          totalCount: dataArray.length,
          firstItem: {
            id: dataArray[0].id,
            stock: dataArray[0].stock,
            stock_number: dataArray[0].stock_number,
            // SEARCH FOR V360.IN URLs IN ALL POSSIBLE FIELDS
            pic: dataArray[0].pic,
            Pic: dataArray[0].Pic,
            picture: dataArray[0].picture,
            Picture: dataArray[0].Picture,
            Image: dataArray[0].Image,
            image: dataArray[0].image,
            imageUrl: dataArray[0].imageUrl,
            'Video link': dataArray[0]['Video link'],
            videoLink: dataArray[0].videoLink,
            video_link: dataArray[0].video_link,
            gem360Url: dataArray[0].gem360Url,
            gem360_url: dataArray[0].gem360_url,
            allFields: Object.keys(dataArray[0])
          },
          // Check for v360.in URLs in first 5 items
          v360UrlsFound: dataArray.slice(0, 5).map(item => ({
            stock: item.stock || item.stock_number,
            hasV360InPic: item.pic?.includes('v360.in'),
            hasV360InPicture: item.picture?.includes('v360.in'),
            hasV360InVideoLink: item['Video link']?.includes('v360.in'),
            picValue: item.pic,
            pictureValue: item.picture,
            videoLinkValue: item['Video link']
          }))
        });
        console.log('📊 INVENTORY SERVICE: Sample diamond data:', dataArray[0]);
        
        // FINAL TEST: Check if ANY item has v360.in ANYWHERE
        const anyV360 = dataArray.some(item => 
          Object.values(item).some(val => 
            typeof val === 'string' && val.includes('v360.in')
          )
        );
        console.log('🔍 FINAL V360 CHECK: Found v360.in in any field?', anyV360);
        
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
    
    // Ultimate fallback to mock data
    const mockResult = await fetchMockInventoryData();
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'ULTIMATE FALLBACK: Mock data after all failures',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_emergency'
      }
    };
  }
}
