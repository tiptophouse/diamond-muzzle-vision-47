import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FASTAPI_BASE_URL = "https://api.mazalbot.com";
const BACKEND_ACCESS_TOKEN = "ifj9ov1rh20fslfp";
const ADMIN_TELEGRAM_ID = 2138564172;

interface MCPRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id?: string | number;
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
    const { action, userId, clientInfo, sessionId, toolCall, uri } = await req.json();
    console.log('🔄 MCP Client action:', action, 'for user:', userId);

    // CRITICAL SECURITY: Only allow admin user to access MCP
    const userIdNumber = parseInt(userId);
    if (userIdNumber !== ADMIN_TELEGRAM_ID) {
      console.log('❌ MCP: Access denied for user:', userIdNumber, 'Admin ID:', ADMIN_TELEGRAM_ID);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Access denied. MCP is restricted to authorized administrators only.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ MCP: Admin access granted for user:', userIdNumber);

    switch (action) {
      case 'initialize':
        return await initializeSession(userId, clientInfo);
      
      case 'call_tool':
        return await callTool(sessionId, toolCall);
      
      case 'get_resource':
        return await getResource(sessionId, uri);
      
      case 'disconnect':
        return await disconnect(sessionId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ MCP Client error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function initializeSession(userId: string, clientInfo: any) {
  console.log('🔄 MCP: Initializing secure session for admin user:', userId);

  try {
    // Initialize MCP session with FastAPI backend
    const initRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: true,
          resources: true,
          prompts: false,
          logging: true
        },
        clientInfo: {
          name: clientInfo.name || "Mazalbot-Admin-Web",
          version: clientInfo.version || "1.0.0"
        }
      }
    };

    console.log('📤 MCP: Sending initialize request to FastAPI backend');
    const response = await fetch(`${FASTAPI_BASE_URL}/mcp/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-ID': userId,
        'X-Admin-Access': 'true',
      },
      body: JSON.stringify(initRequest),
    });

    if (!response.ok) {
      throw new Error(`FastAPI MCP initialization failed: ${response.status}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    console.log('📥 MCP: Received initialize response');

    if (mcpResponse.error) {
      throw new Error(`MCP Error: ${mcpResponse.error.message}`);
    }

    // Get available tools for diamond management
    const toolsRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };

    const toolsResponse = await fetch(`${FASTAPI_BASE_URL}/mcp/tools`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-ID': userId,
        'X-Admin-Access': 'true',
      },
      body: JSON.stringify(toolsRequest),
    });

    const toolsData: MCPResponse = await toolsResponse.json();
    
    // Get available resources
    const resourcesRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "resources/list",
      params: {}
    };

    const resourcesResponse = await fetch(`${FASTAPI_BASE_URL}/mcp/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-ID': userId,
        'X-Admin-Access': 'true',
      },
      body: JSON.stringify(resourcesRequest),
    });

    const resourcesData: MCPResponse = await resourcesResponse.json();

    const sessionData = {
      sessionId: `mcp_admin_${userId}_${Date.now()}`,
      clientInfo,
      serverInfo: mcpResponse.result?.serverInfo || {
        name: "Mazalbot-FastAPI-MCP-Secure",
        version: "1.0.0",
        protocolVersion: "2024-11-05"
      },
      capabilities: mcpResponse.result?.capabilities || {
        tools: true,
        resources: true,
        prompts: false,
        logging: true
      }
    };

    console.log('✅ MCP: Secure session initialized successfully for admin');

    return new Response(
      JSON.stringify({
        success: true,
        session: sessionData,
        tools: toolsData.result?.tools || [],
        resources: resourcesData.result?.resources || []
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ MCP: Secure session initialization failed:', error);
    throw error;
  }
}

async function callTool(sessionId: string, toolCall: any) {
  console.log('🛠️ MCP: Admin calling tool:', toolCall.name);

  try {
    const toolRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolCall.name,
        arguments: toolCall.arguments
      }
    };

    console.log('📤 MCP: Sending admin tool call to FastAPI backend');
    const response = await fetch(`${FASTAPI_BASE_URL}/mcp/tools/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
        'X-Admin-Access': 'true',
      },
      body: JSON.stringify(toolRequest),
    });

    if (!response.ok) {
      throw new Error(`Admin tool call failed: ${response.status}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    console.log('📥 MCP: Received admin tool response');

    if (mcpResponse.error) {
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            content: [{
              type: 'text',
              text: `Error: ${mcpResponse.error.message}`
            }],
            isError: true
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ MCP: Admin tool call successful');

    return new Response(
      JSON.stringify({
        success: true,
        result: mcpResponse.result
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ MCP: Admin tool call failed:', error);
    throw error;
  }
}

async function getResource(sessionId: string, uri: string) {
  console.log('📄 MCP: Admin getting resource:', uri);

  try {
    const resourceRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "resources/read",
      params: {
        uri: uri
      }
    };

    console.log('📤 MCP: Sending admin resource request to FastAPI backend');
    const response = await fetch(`${FASTAPI_BASE_URL}/mcp/resources/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
        'X-Admin-Access': 'true',
      },
      body: JSON.stringify(resourceRequest),
    });

    if (!response.ok) {
      throw new Error(`Admin resource fetch failed: ${response.status}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    console.log('📥 MCP: Received admin resource response');

    if (mcpResponse.error) {
      throw new Error(`MCP Error: ${mcpResponse.error.message}`);
    }

    console.log('✅ MCP: Admin resource retrieved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        resource: mcpResponse.result
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ MCP: Admin resource fetch failed:', error);
    throw error;
  }
}

async function disconnect(sessionId: string) {
  console.log('🔌 MCP: Disconnecting admin session:', sessionId);

  try {
    const disconnectRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "session/end",
      params: {}
    };

    await fetch(`${FASTAPI_BASE_URL}/mcp/session/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
        'X-Admin-Access': 'true',
      },
      body: JSON.stringify(disconnectRequest),
    }).catch(err => console.warn('Admin session end notification failed:', err));

    console.log('✅ MCP: Admin session disconnected');

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ MCP: Admin disconnect failed:', error);
    throw error;
  }
}
