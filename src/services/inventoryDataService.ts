
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from "@/lib/api";
import { fetchMockInventoryData } from "./mockInventoryService";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('🔍 INVENTORY SERVICE: Fetching data via Supabase edge function for user:', userId);
  
  const debugInfo = { 
    step: 'Starting inventory fetch via edge function', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'edge-function'
  };
  
  try {
    console.log('🚀 INVENTORY SERVICE: Calling diamond-management edge function...');
    
    const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('diamond-management', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-action': 'get_all',
        'x-user_id': userId.toString()
      }
    });

    if (edgeError) {
      console.error('❌ INVENTORY SERVICE: Edge function error:', edgeError);
      throw new Error(edgeError.message);
    }

    if (!edgeResponse) {
      console.error('❌ INVENTORY SERVICE: No response from edge function');
      throw new Error('No response from diamond management service');
    }

    if (!edgeResponse.success) {
      console.error('❌ INVENTORY SERVICE: Edge function returned error:', edgeResponse.error);
      throw new Error(edgeResponse.error || 'Diamond management service failed');
    }

    if (edgeResponse.data && Array.isArray(edgeResponse.data) && edgeResponse.data.length > 0) {
      console.log('✅ INVENTORY SERVICE: Edge function returned', edgeResponse.data.length, 'diamonds');
      console.log('✅ INVENTORY SERVICE: Data source:', edgeResponse.source || 'fastapi-via-edge-function');
      
      return {
        data: edgeResponse.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Edge function data fetched',
          totalDiamonds: edgeResponse.data.length,
          dataSource: edgeResponse.source || 'fastapi-via-edge-function',
          count: edgeResponse.count || edgeResponse.data.length
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: Edge function returned empty data');
    throw new Error('No diamonds found in edge function response');
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Edge function connection failed:", error);
    
    // Fallback to mock data only if edge function is completely unreachable
    console.log('🔄 INVENTORY SERVICE: Using mock data as fallback');
    const mockResult = await fetchMockInventoryData();
    
    return {
      ...mockResult,
      debugInfo: {
        ...debugInfo,
        ...mockResult.debugInfo,
        step: 'FALLBACK: Using mock data after edge function failure',
        error: error instanceof Error ? error.message : String(error),
        dataSource: 'mock_fallback'
      }
    };
  }
}
