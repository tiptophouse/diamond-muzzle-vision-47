import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      seller_telegram_id, 
      buyer_telegram_id, 
      buyer_name,
      notification_id,
      diamond_count,
      total_value,
      message_preview,
      diamonds_data 
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Track the contact event
    const { data, error } = await supabase
      .from('buyer_contact_tracking')
      .insert({
        seller_telegram_id,
        buyer_telegram_id,
        buyer_name,
        notification_id,
        diamond_count,
        total_value,
        message_preview: message_preview?.substring(0, 200),
        diamonds_data,
        contacted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Tracking error:', error);
      throw error;
    }

    console.log('✅ Contact tracked:', data.id);

    return new Response(
      JSON.stringify({ success: true, tracking_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking contact:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to track contact',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
