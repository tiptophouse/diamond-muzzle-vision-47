import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FASTAPI_MCP_URL = 'https://api.mazalbot.com/mcp/messages';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mcpToken = Deno.env.get('FASTAPI_MCP_TOKEN');
    
    if (!mcpToken) {
      throw new Error('FASTAPI_MCP_TOKEN not configured');
    }

    const body = await req.json();
    const { method, tool_name, arguments: toolArgs, resource_uri } = body;

    console.log('🔧 MCP Bridge Request:', { method, tool_name, resource_uri });

    // Build JSON-RPC 2.0 request for MCP protocol
    let mcpRequest: any = {
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: method,
      params: {}
    };

    // Add method-specific parameters
    if (method === 'call_tool' && tool_name) {
      mcpRequest.params = {
        name: tool_name,
        arguments: toolArgs || {}
      };
    } else if (method === 'read_resource' && resource_uri) {
      mcpRequest.params = {
        uri: resource_uri
      };
    }

    console.log('📤 Sending to FastAPI MCP:', mcpRequest);

    // Call FastAPI MCP endpoint
    const response = await fetch(FASTAPI_MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mcpToken}`,
      },
      body: JSON.stringify(mcpRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI MCP error:', response.status, errorText);
      throw new Error(`FastAPI MCP error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ FastAPI MCP response:', result);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('💥 MCP Bridge error:', error);
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
