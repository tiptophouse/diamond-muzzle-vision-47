import { supabase } from '@/integrations/supabase/client';

export interface MCPToolCall {
  tool_name: string;
  arguments?: Record<string, any>;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Call a tool via the FastAPI MCP bridge
 */
export async function callMCPTool<T = any>(
  toolName: string,
  args?: Record<string, any>
): Promise<MCPResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke('fastapi-mcp-bridge', {
      body: {
        method: 'call_tool',
        tool_name: toolName,
        arguments: args || {},
      },
    });

    if (error) {
      console.error('❌ MCP tool call error:', error);
      return { success: false, error: error.message };
    }

    return data as MCPResponse<T>;
  } catch (err) {
    console.error('💥 MCP tool call exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * List all available tools from FastAPI MCP
 */
export async function listMCPTools(): Promise<MCPResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('fastapi-mcp-bridge', {
      body: {
        method: 'list_tools',
      },
    });

    if (error) {
      console.error('❌ MCP list tools error:', error);
      return { success: false, error: error.message };
    }

    return data as MCPResponse;
  } catch (err) {
    console.error('💥 MCP list tools exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Read a resource from FastAPI MCP
 */
export async function readMCPResource(uri: string): Promise<MCPResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('fastapi-mcp-bridge', {
      body: {
        method: 'read_resource',
        resource_uri: uri,
      },
    });

    if (error) {
      console.error('❌ MCP read resource error:', error);
      return { success: false, error: error.message };
    }

    return data as MCPResponse;
  } catch (err) {
    console.error('💥 MCP read resource exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * List all available resources from FastAPI MCP
 */
export async function listMCPResources(): Promise<MCPResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('fastapi-mcp-bridge', {
      body: {
        method: 'list_resources',
      },
    });

    if (error) {
      console.error('❌ MCP list resources error:', error);
      return { success: false, error: error.message };
    }

    return data as MCPResponse;
  } catch (err) {
    console.error('💥 MCP list resources exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
