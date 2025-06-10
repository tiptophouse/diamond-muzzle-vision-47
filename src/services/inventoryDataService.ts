
// Secure inventory data service - uses only Supabase for data access
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from "@/lib/api";

export interface FetchInventoryResult {
  data?: any[];
  error?: string;
  debugInfo: any;
}

export async function fetchInventoryData(): Promise<FetchInventoryResult> {
  const userId = getCurrentUserId();
  
  console.log('🔍 INVENTORY SERVICE: Starting Supabase fetch with user ID:', userId);
  
  const debugInfo = { 
    step: 'Starting Supabase fetch', 
    userId, 
    timestamp: new Date().toISOString() 
  };
  
  try {
    console.log('🔍 INVENTORY SERVICE: Using Supabase client for secure data access');
    
    let query = supabase
      .from('inventory')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Only filter by user_id if we have one (for authenticated users)
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error: fetchError } = await query;
    
    const updatedDebugInfo = { 
      ...debugInfo,
      step: 'Supabase query completed',
      hasError: !!fetchError,
      hasData: !!data,
      timestamp: new Date().toISOString()
    };
    
    if (fetchError) {
      console.error('🔍 INVENTORY SERVICE: Supabase error:', fetchError);
      return {
        data: [],
        error: fetchError.message,
        debugInfo: {
          ...updatedDebugInfo,
          step: 'Supabase query error',
          error: fetchError.message,
        }
      };
    }
    
    if (!data || data.length === 0) {
      console.log('🔍 INVENTORY SERVICE: No data returned from Supabase');
      return {
        data: [],
        error: 'No inventory data found',
        debugInfo: {
          ...updatedDebugInfo,
          step: 'No data found in Supabase',
        }
      };
    }
    
    console.log('🔍 INVENTORY SERVICE: SUCCESS! Retrieved', data.length, 'diamonds from Supabase');
    
    return {
      data: data,
      debugInfo: {
        ...updatedDebugInfo,
        step: 'SUCCESS: Data fetched from Supabase',
        totalDiamonds: data.length,
        sampleItem: data[0],
      }
    };
  } catch (error) {
    console.error("🔍 INVENTORY SERVICE: Critical error with Supabase:", error);
    
    return {
      data: [],
      error: error instanceof Error ? error.message : String(error),
      debugInfo: {
        ...debugInfo,
        step: 'Critical Supabase connection error',
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      }
    };
  }
}
