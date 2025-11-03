import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ButtonClickRequest {
  telegramUserId: number;
  userFirstName?: string;
  userUsername?: string;
  buttonId: string;
  buttonLabel: string;
  targetPage: string;
}

serve(async (req) => {
  console.log('🔘 Track button click function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      telegramUserId, 
      userFirstName, 
      userUsername, 
      buttonId, 
      buttonLabel, 
      targetPage 
    }: ButtonClickRequest = await req.json();
    
    console.log('📥 Button click data:', { 
      telegramUserId,
      userFirstName,
      buttonId,
      targetPage
    });

    if (!telegramUserId || !buttonId || !buttonLabel || !targetPage) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Track button click
    const { data: clickData, error: clickError } = await supabase
      .from('telegram_button_clicks')
      .insert({
        telegram_user_id: telegramUserId,
        user_first_name: userFirstName,
        user_username: userUsername,
        button_id: buttonId,
        button_label: buttonLabel,
        target_page: targetPage
      })
      .select()
      .single();

    if (clickError) {
      console.error('❌ Failed to track button click:', clickError);
      return new Response(
        JSON.stringify({ error: 'Failed to track click', details: clickError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Button click tracked:', clickData.id);

    return new Response(
      JSON.stringify({
        success: true,
        clickId: clickData.id,
        message: 'Button click tracked successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Track button click error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to track button click'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
