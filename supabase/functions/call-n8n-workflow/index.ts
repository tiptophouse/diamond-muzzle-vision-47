import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n webhook URL from MCP workflow details
const N8N_WEBHOOK_URL = 'https://n8nlo.app.n8n.cloud/webhook/ae74c72e-bb87-4235-a5a8-392b0c3ea291';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, telegram_id, group_id, additional_context } = await req.json();
    
    console.log('📤 Calling n8n workflow with:', { 
      message, 
      telegram_id, 
      group_id,
      webhook: N8N_WEBHOOK_URL 
    });

    // Call n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message || 'Hello from BrilliantBot',
        telegram_id,
        group_id,
        timestamp: new Date().toISOString(),
        context: additional_context || {},
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
