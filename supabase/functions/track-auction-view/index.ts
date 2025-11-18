import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auction_id, viewer_id, source_group_id, sharer_id, tracking_id } = await req.json();

    console.log('📊 Tracking auction view:', {
      auction_id,
      viewer_id,
      source_group_id,
      sharer_id,
      tracking_id,
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Track view in auction_analytics
    const { error: analyticsError } = await supabase
      .from('auction_analytics')
      .insert({
        auction_id,
        telegram_id: viewer_id,
        group_chat_id: source_group_id ? parseInt(source_group_id) : null,
        event_type: 'view',
        event_data: {
          tracking_id,
          sharer_id,
          timestamp: new Date().toISOString(),
        },
      });

    if (analyticsError) {
      console.error('❌ Failed to track analytics:', analyticsError);
      throw analyticsError;
    }

    // Update auction view counters
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        total_views: supabase.rpc('increment', { field: 'total_views' }),
      })
      .eq('id', auction_id);

    if (updateError) {
      console.error('❌ Failed to update counters:', updateError);
    }

    // If there's a sharer, increment their viral score
    if (sharer_id) {
      const { error: sharerError } = await supabase
        .from('user_profiles')
        .update({
          shares_count: supabase.rpc('increment', { field: 'shares_count' }),
        })
        .eq('telegram_id', sharer_id);

      if (sharerError) {
        console.error('⚠️ Failed to update sharer stats:', sharerError);
      }
    }

    console.log('✅ Auction view tracked successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error tracking auction view:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
