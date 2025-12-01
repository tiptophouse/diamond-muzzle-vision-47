import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URLs - Update these after creating workflows
const N8N_WEBHOOKS = {
  auction_create: 'https://n8nlo.app.n8n.cloud/webhook/auction-create',
  auction_bid: 'https://n8nlo.app.n8n.cloud/webhook/auction-bid',
  diamond_ai: 'https://n8nlo.app.n8n.cloud/webhook/ae74c72e-bb87-4235-a5a8-392b0c3ea291', // existing
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, ...payload } = body;
    
    // Route to correct n8n workflow based on action
    const webhookUrl = N8N_WEBHOOKS[action as keyof typeof N8N_WEBHOOKS] || N8N_WEBHOOKS.diamond_ai;
    
    console.log('📤 Calling n8n workflow:', { 
      action,
      webhook: webhookUrl,
      payload: Object.keys(payload)
    });

    // Call n8n webhook with full payload
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n webhook error:', response.status, errorText);
      throw new Error(`n8n workflow failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ n8n workflow response:', result);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: 'n8n workflow executed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('💥 Error calling n8n workflow:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
