import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const FASTAPI_MCP_ENDPOINT = 'https://api.mazalbot.com/mcp';
const FASTAPI_MCP_TOKEN = Deno.env.get('FASTAPI_MCP_TOKEN');

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!FASTAPI_MCP_TOKEN) {
      throw new Error('FASTAPI_MCP_TOKEN not configured');
    }

    const mcpRequest: MCPRequest = await req.json();
    console.log('📡 MCP Bridge: Forwarding request to FastAPI MCP:', mcpRequest.method);

    // Forward request to FastAPI MCP endpoint
    const response = await fetch(FASTAPI_MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASTAPI_MCP_TOKEN}`,
      },
      body: JSON.stringify(mcpRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI MCP error:', response.status, errorText);
      throw new Error(`FastAPI MCP error: ${response.status} ${errorText}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    console.log('✅ MCP Bridge: Response received from FastAPI');

    return new Response(
      JSON.stringify(mcpResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ MCP Bridge error:', error);
    
    // Return MCP-formatted error
    const errorResponse: MCPResponse = {
      jsonrpc: '2.0',
      id: 0,
      error: {
        code: -32603,
        message: error.message || 'Internal error',
      },
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
