
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
    // Call GET /api/v1/get_all_stones?user_id={user_id}
    console.log('🔍 INVENTORY SERVICE: Attempting FastAPI connection...');
    const endpoint = apiEndpoints.getAllStones(userId);
    
    const result = await api.get(endpoint);
    
    if (result.data && !result.error) {
      let dataArray: any[] = [];
      
      if (Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (typeof result.data === 'object' && result.data !== null) {
        const dataObj = result.data as Record<string, any>;
        const possibleArrayKeys = ['data', 'diamonds', 'items', 'stones', 'results', 'inventory', 'records'];
        
        for (const key of possibleArrayKeys) {
          if (Array.isArray(dataObj[key])) {
            dataArray = dataObj[key];
            break;
          }
        }
      }
      
      if (dataArray && dataArray.length > 0) {
        console.log('✅ INVENTORY SERVICE: FastAPI returned', dataArray.length, 'diamonds');
        
        // Transform and map API data to our Diamond interface
        const transformedData = dataArray.map(item => ({
          // Map API fields to our Diamond interface
          id: item.id?.toString() || `${item.stock_number || item.stock || Date.now()}`,
          diamond_id: item.id || item.diamond_id, // Store the API diamond ID
          stockNumber: item.stock_number || item.stock || item.stockNumber || '',
          stock_number: item.stock_number || item.stock, // Keep original API field
          shape: item.shape || 'Round',
          carat: Number(item.weight || item.carat) || 0,
          weight: Number(item.weight || item.carat) || 0, // Keep original API field
          color: item.color || 'D',
          clarity: item.clarity || 'FL',
          cut: item.cut || 'Excellent',
          price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
          status: item.status || 'Available',
          imageUrl: item.picture || item.imageUrl || item.image_url || undefined,
          picture: item.picture, // Keep original API field
          store_visible: item.store_visible !== false,
          certificateNumber: item.certificate_number?.toString() || item.certificateNumber || undefined,
          lab: item.lab || undefined,
          certificateUrl: item.certificate_url || item.certificateUrl || undefined,
          // Include all other API fields for compatibility
          ...item
        }));
        
        // Sort diamonds by updated_at desc (most recently edited first)
        const sortedData = transformedData.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        return {
          data: sortedData,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI data fetched and transformed',
            totalDiamonds: sortedData.length,
            dataSource: 'fastapi'
          }
        };
      }
    }
    
    // If FastAPI fails, try localStorage as fallback
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
        console.warn('Failed to parse localStorage data:', parseError);
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
    console.error("🔍 INVENTORY SERVICE: Error occurred:", error);
    
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
        console.warn('Emergency localStorage parse failed:', parseError);
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
