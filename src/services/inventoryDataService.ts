
import { api } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

export const fetchInventoryData = async () => {
  try {
    console.log('🔍 INVENTORY: Starting data fetch...');

    // Get data from Supabase with soft delete filter
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('inventory')
      .select('*')
      .is('deleted_at', null) // Only get non-deleted items
      .order('created_at', { ascending: false });

    if (supabaseError) {
      console.error('🔍 INVENTORY: Supabase error:', supabaseError);
      throw new Error(`Supabase fetch failed: ${supabaseError.message}`);
    }

    console.log('🔍 INVENTORY: Supabase returned', supabaseData?.length || 0, 'items');

    // Try external API as fallback/supplement
    let externalData = [];
    try {
      const response = await api.get('/get_all_stones');
      if (response && Array.isArray(response)) {
        externalData = response;
        console.log('🔍 INVENTORY: External API returned', externalData.length, 'items');
      }
    } catch (apiError) {
      console.warn('🔍 INVENTORY: External API failed, using Supabase only:', apiError);
    }

    // Combine and deduplicate data (Supabase takes priority)
    const combinedData = [...(supabaseData || [])];
    const existingStockNumbers = new Set(combinedData.map(item => item.stock_number));
    
    // Add external items that don't exist in Supabase
    externalData.forEach(item => {
      const stockNumber = item.stock_number || item.Stock;
      if (stockNumber && !existingStockNumbers.has(stockNumber)) {
        // Map external data to match our database schema
        const mappedItem = {
          id: item.id || `ext-${stockNumber}`,
          stock_number: stockNumber,
          shape: item.shape || item.Shape || 'Round',
          weight: Number(item.weight || item.Weight || item.carat || 1),
          color: item.color || item.Color || 'D',
          clarity: item.clarity || item.Clarity || 'VS1',
          cut: item.cut || item.Cut || 'Excellent',
          price_per_carat: Number(item.price_per_carat || item['Price/Crt'] || item.price || 1000),
          status: item.status || 'Available',
          picture: item.picture || item.Pic || item.photo,
          store_visible: true,
          fluorescence: item.fluorescence || item.Fluo || 'None',
          lab: item.lab || item.Lab || 'GIA',
          certificate_number: item.certificate_number || item.CertNumber || null,
          polish: item.polish || item.Polish || 'Excellent',
          symmetry: item.symmetry || item.Symm || 'Excellent',
          table_percentage: item.table_percentage || item.Table || null,
          depth_percentage: item.depth_percentage || item.Depth || null,
          user_id: 2138564172, // Default external user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add missing required fields with defaults
          certificate_comment: null,
          certificate_url: null,
          culet: null,
          deleted_at: null,
          depth: null,
          gridle: null,
          length: null,
          rapnet: null,
          ratio: null,
          width: null,
        };
        combinedData.push(mappedItem);
      }
    });

    return {
      data: combinedData,
      debugInfo: {
        step: 'Data fetched successfully',
        supabaseCount: supabaseData?.length || 0,
        externalCount: externalData.length,
        combinedCount: combinedData.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('🔍 INVENTORY: Service error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      debugInfo: {
        step: 'Service error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    };
  }
};
