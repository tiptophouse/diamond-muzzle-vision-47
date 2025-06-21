
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId() || 2138564172;
  
  console.log('📊 INVENTORY SERVICE: Starting data fetch for user:', userId);
  
  const debugInfo = { 
    step: 'Starting enhanced inventory fetch', 
    userId, 
    timestamp: new Date().toISOString(),
    dataSource: 'edge-function-primary',
    attemptNumber: 1
  };
  
  try {
    console.log('🚀 INVENTORY SERVICE: Calling enhanced diamond-management function...');
    
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
      throw new Error(`Edge function failed: ${edgeError.message}`);
    }

    if (!edgeResponse) {
      console.error('❌ INVENTORY SERVICE: No response from edge function');
      throw new Error('No response from diamond management service');
    }

    console.log('📊 INVENTORY SERVICE: Edge response received:', {
      success: edgeResponse.success,
      dataCount: Array.isArray(edgeResponse.data) ? edgeResponse.data.length : 'N/A',
      source: edgeResponse.source,
      message: edgeResponse.message
    });

    if (!edgeResponse.success) {
      console.error('❌ INVENTORY SERVICE: Edge function returned error:', edgeResponse.error);
      throw new Error(edgeResponse.error || 'Diamond management service failed');
    }

    if (edgeResponse.data && Array.isArray(edgeResponse.data)) {
      console.log('✅ INVENTORY SERVICE: Successfully loaded', edgeResponse.data.length, 'diamonds');
      
      return {
        data: edgeResponse.data,
        debugInfo: {
          ...debugInfo,
          step: 'SUCCESS: Data loaded from FastAPI via edge function',
          totalDiamonds: edgeResponse.data.length,
          dataSource: edgeResponse.source || 'fastapi-via-edge-function',
          count: edgeResponse.count || edgeResponse.data.length,
          message: edgeResponse.message
        }
      };
    }
    
    console.log('⚠️ INVENTORY SERVICE: Empty data returned from edge function');
    return {
      data: [],
      debugInfo: {
        ...debugInfo,
        step: 'SUCCESS: Empty data set returned',
        totalDiamonds: 0,
        dataSource: edgeResponse.source || 'fastapi-via-edge-function',
        message: 'No diamonds found in your inventory'
      }
    };
    
  } catch (error) {
    console.error("❌ INVENTORY SERVICE: Complete failure:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      error: `Failed to load inventory: ${errorMessage}`,
      debugInfo: {
        ...debugInfo,
        step: 'FAILED: Unable to load inventory data',
        error: errorMessage,
        dataSource: 'error-state',
        message: 'Please check your API configuration and try again'
      }
    };
  }
}
