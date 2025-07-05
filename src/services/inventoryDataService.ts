
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
        
        // Filter out blacklisted diamonds
        const blacklistJson = localStorage.getItem('deleted_diamonds_blacklist');
        const blacklist = blacklistJson ? new Set(JSON.parse(blacklistJson)) : new Set();
        
        const filteredData = dataArray.filter(item => {
          const diamondId = item.id || item.diamond_id || item.stock_number;
          const isBlacklisted = blacklist.has(String(diamondId));
          if (isBlacklisted) {
            console.log('🚫 INVENTORY SERVICE: Filtering out blacklisted diamond:', diamondId);
          }
          return !isBlacklisted;
        });
        
        console.log('🔍 INVENTORY SERVICE: After blacklist filter:', filteredData.length, 'diamonds');
        
        // Sort diamonds by updated_at desc (most recently edited first)
        const sortedData = filteredData.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        return {
          data: sortedData,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: FastAPI data fetched and filtered',
            totalDiamonds: sortedData.length,
            blacklistedCount: dataArray.length - filteredData.length,
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
          // Filter for current user and apply blacklist
          const userDiamonds = parsedData.filter(item => 
            !item.user_id || item.user_id === userId
          );
          
          const blacklistJson = localStorage.getItem('deleted_diamonds_blacklist');
          const blacklist = blacklistJson ? new Set(JSON.parse(blacklistJson)) : new Set();
          
          const filteredDiamonds = userDiamonds.filter(item => {
            const diamondId = item.id || item.diamond_id || item.stock_number;
            return !blacklist.has(String(diamondId));
          });
          
          if (filteredDiamonds.length > 0) {
            console.log('✅ INVENTORY SERVICE: Found', filteredDiamonds.length, 'diamonds in localStorage (after blacklist)');
            
            return {
              data: filteredDiamonds,
              debugInfo: {
                ...debugInfo,
                step: 'SUCCESS: localStorage data found and filtered',
                totalDiamonds: filteredDiamonds.length,
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
          
          // Apply blacklist filter
          const blacklistJson = localStorage.getItem('deleted_diamonds_blacklist');
          const blacklist = blacklistJson ? new Set(JSON.parse(blacklistJson)) : new Set();
          
          const filteredDiamonds = userDiamonds.filter(item => {
            const diamondId = item.id || item.diamond_id || item.stock_number;
            return !blacklist.has(String(diamondId));
          });
          
          return {
            data: filteredDiamonds,
            debugInfo: {
              ...debugInfo,
              step: 'EMERGENCY: localStorage fallback after error with blacklist',
              totalDiamonds: filteredDiamonds.length,
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
