import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get FastAPI backend token
    const backendToken = Deno.env.get('FASTAPI_BEARER_TOKEN') || Deno.env.get('BACKEND_ACCESS_TOKEN');
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com';

    if (!backendToken) {
      console.error('❌ FASTAPI_BEARER_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Backend configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Checking subscription status for user ${user_id}`);

    // Call FastAPI endpoint
    const response = await fetch(`${backendUrl}/api/v1/user/active-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ FastAPI error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch subscription status',
          is_active: false,
          subscription_type: 'none'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscriptionData = await response.json();
    console.log(`✅ Subscription data received:`, subscriptionData);

    return new Response(
      JSON.stringify(subscriptionData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error checking subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        is_active: false,
        subscription_type: 'none'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
