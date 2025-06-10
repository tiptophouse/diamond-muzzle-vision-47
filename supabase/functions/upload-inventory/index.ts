
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondData {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat: number;
  certificate_number?: string;
  status?: string;
  user_id: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { diamonds, user_id } = await req.json();
    
    console.log('📤 Processing CSV upload for user:', user_id, 'diamonds:', diamonds?.length);

    if (!diamonds || !Array.isArray(diamonds) || diamonds.length === 0) {
      throw new Error('No diamond data provided');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Process and validate diamond data
    const processedDiamonds = diamonds.map((diamond: any, index: number) => {
      const processed: DiamondData = {
        stock_number: diamond.stockNumber || diamond.stock_number || `AUTO-${Date.now()}-${index}`,
        shape: diamond.shape || 'Round',
        weight: Number(diamond.carat || diamond.weight || 1),
        color: diamond.color || 'G',
        clarity: diamond.clarity || 'VS1',
        cut: diamond.cut || 'Excellent',
        price_per_carat: Number(diamond.price || diamond.price_per_carat || 1000),
        certificate_number: diamond.certificateNumber || diamond.certificate_number,
        status: diamond.status || 'Available',
        user_id: Number(user_id)
      };

      // Validate required fields
      if (!processed.shape || !processed.color || !processed.clarity) {
        throw new Error(`Invalid diamond data at index ${index}: missing required fields`);
      }

      if (processed.weight <= 0 || processed.price_per_carat <= 0) {
        throw new Error(`Invalid diamond data at index ${index}: weight and price must be positive`);
      }

      return processed;
    });

    console.log('💎 Processed diamonds:', processedDiamonds.length);

    // Insert diamonds into inventory table
    const { data, error } = await supabase
      .from('inventory')
      .insert(processedDiamonds.map(diamond => ({
        stock_number: diamond.stock_number,
        shape: diamond.shape,
        weight: diamond.weight,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        price_per_carat: diamond.price_per_carat,
        certificate_number: diamond.certificate_number,
        status: diamond.status,
        user_id: diamond.user_id,
        store_visible: true, // Make diamonds visible in store by default
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Successfully inserted diamonds:', data?.length);

    // Create notification for successful upload
    await supabase
      .from('notifications')
      .insert({
        telegram_id: user_id,
        message_type: 'inventory_upload',
        message_content: `Successfully uploaded ${data?.length || 0} diamonds to your inventory`,
        metadata: {
          upload_count: data?.length || 0,
          timestamp: new Date().toISOString()
        },
        status: 'sent'
      });

    return new Response(
      JSON.stringify({
        success: true,
        totalItems: data?.length || 0,
        matched_pairs: 0, // For compatibility with existing UI
        errors: []
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
