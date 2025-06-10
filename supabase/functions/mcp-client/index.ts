
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const FASTAPI_BASE_URL = "https://api.mazalbot.com";
const BACKEND_ACCESS_TOKEN = "ifj9ov1rh20fslfp";

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
    console.log('🔄 MCP Client action:', action);

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
  console.log('🔄 MCP: Initializing session for user:', userId);

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
          name: clientInfo.name || "Mazalbot-Web",
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

    // Get available tools
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
      },
      body: JSON.stringify(resourcesRequest),
    });

    const resourcesData: MCPResponse = await resourcesResponse.json();

    const sessionData = {
      sessionId: `mcp_${userId}_${Date.now()}`,
      clientInfo,
      serverInfo: mcpResponse.result?.serverInfo || {
        name: "Mazalbot-FastAPI-MCP",
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

    console.log('✅ MCP: Session initialized successfully');

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
    console.error('❌ MCP: Session initialization failed:', error);
    throw error;
  }
}

async function callTool(sessionId: string, toolCall: any) {
  console.log('🛠️ MCP: Calling tool:', toolCall.name);

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

    console.log('📤 MCP: Sending tool call to FastAPI backend');
    const response = await fetch(`${FASTAPI_BASE_URL}/mcp/tools/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify(toolRequest),
    });

    if (!response.ok) {
      throw new Error(`Tool call failed: ${response.status}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    console.log('📥 MCP: Received tool response');

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

    console.log('✅ MCP: Tool call successful');

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
    console.error('❌ MCP: Tool call failed:', error);
    throw error;
  }
}

async function getResource(sessionId: string, uri: string) {
  console.log('📄 MCP: Getting resource:', uri);

  try {
    const resourceRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "resources/read",
      params: {
        uri: uri
      }
    };

    console.log('📤 MCP: Sending resource request to FastAPI backend');
    const response = await fetch(`${FASTAPI_BASE_URL}/mcp/resources/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify(resourceRequest),
    });

    if (!response.ok) {
      throw new Error(`Resource fetch failed: ${response.status}`);
    }

    const mcpResponse: MCPResponse = await response.json();
    console.log('📥 MCP: Received resource response');

    if (mcpResponse.error) {
      throw new Error(`MCP Error: ${mcpResponse.error.message}`);
    }

    console.log('✅ MCP: Resource retrieved successfully');

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
    console.error('❌ MCP: Resource fetch failed:', error);
    throw error;
  }
}

async function disconnect(sessionId: string) {
  console.log('🔌 MCP: Disconnecting session:', sessionId);

  try {
    // Optionally notify FastAPI backend about session termination
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
      },
      body: JSON.stringify(disconnectRequest),
    }).catch(err => console.warn('Session end notification failed:', err));

    console.log('✅ MCP: Session disconnected');

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ MCP: Disconnect failed:', error);
    throw error;
  }
}
