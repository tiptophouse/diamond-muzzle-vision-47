
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";
import { supabase } from "@/integrations/supabase/client";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

// Direct Supabase fallback function
async function fetchFromSupabase(userId: number): Promise<any[]> {
  console.log('🔄 INVENTORY SERVICE: Fetching directly from Supabase for user:', userId);
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  
  if (error) {
    console.error('❌ INVENTORY SERVICE: Supabase error:', error);
    throw error;
  }
  
  console.log('✅ INVENTORY SERVICE: Supabase returned', data?.length || 0, 'diamonds');
  if (data && data.length > 0) {
    console.log('📊 INVENTORY SERVICE: Sample Supabase diamond:', data[0]);
    // Log certificate_url specifically
    const withCertUrls = data.filter(d => d.certificate_url);
    console.log('🔗 INVENTORY SERVICE: Diamonds with certificate URLs:', withCertUrls.length);
    if (withCertUrls.length > 0) {
      console.log('🔗 INVENTORY SERVICE: Sample certificate URL:', withCertUrls[0].certificate_url);
    }
  }
  
  return data || [];
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
    
    // If FastAPI fails, try Supabase directly
    console.log('🔄 INVENTORY SERVICE: FastAPI failed, trying Supabase...');
    try {
      const supabaseData = await fetchFromSupabase(userId);
      if (supabaseData.length > 0) {
        return {
          data: supabaseData,
          debugInfo: {
            ...debugInfo,
            step: 'SUCCESS: Supabase data fetched',
            totalDiamonds: supabaseData.length,
            dataSource: 'supabase'
          }
        };
      }
    } catch (supabaseError) {
      console.error('❌ INVENTORY SERVICE: Supabase failed:', supabaseError);
    }
    
    // If Supabase fails, try localStorage
    console.log('🔄 INVENTORY SERVICE: Supabase failed, checking localStorage...');
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
