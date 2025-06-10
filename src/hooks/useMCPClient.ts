
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MCPSession, MCPTool, MCPResource, MCPToolCall, MCPToolResult } from '@/lib/mcp/types';

export function useMCPClient() {
  const [session, setSession] = useState<MCPSession | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const initializeSession = useCallback(async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to use MCP features",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔄 MCP: Initializing session...');
      
      const { data, error } = await supabase.functions.invoke('mcp-client', {
        body: {
          action: 'initialize',
          userId: user.id.toString(),
          clientInfo: {
            name: 'Mazalbot-Web',
            version: '1.0.0'
          }
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize MCP session');
      }

      setSession(data.session);
      setTools(data.tools || []);
      setResources(data.resources || []);
      setIsConnected(true);

      console.log('✅ MCP: Session initialized successfully');
      toast({
        title: "MCP Connected",
        description: "Model Context Protocol session established successfully",
      });

      return true;
    } catch (error) {
      console.error('❌ MCP: Session initialization failed:', error);
      toast({
        variant: "destructive",
        title: "MCP Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to MCP server",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const callTool = useCallback(async (toolCall: MCPToolCall): Promise<MCPToolResult | null> => {
    if (!session || !isConnected) {
      toast({
        variant: "destructive",
        title: "MCP Not Connected",
        description: "Please establish MCP connection first",
      });
      return null;
    }

    try {
      console.log('🛠️ MCP: Calling tool:', toolCall.name);
      
      const { data, error } = await supabase.functions.invoke('mcp-client', {
        body: {
          action: 'call_tool',
          sessionId: session.sessionId,
          toolCall,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Tool call failed');
      }

      console.log('✅ MCP: Tool call successful');
      return data.result;
    } catch (error) {
      console.error('❌ MCP: Tool call failed:', error);
      toast({
        variant: "destructive",
        title: "Tool Call Failed",
        description: error instanceof Error ? error.message : "Failed to execute tool",
      });
      return null;
    }
  }, [session, isConnected, toast]);

  const getResource = useCallback(async (uri: string): Promise<any | null> => {
    if (!session || !isConnected) {
      return null;
    }

    try {
      console.log('📄 MCP: Getting resource:', uri);
      
      const { data, error } = await supabase.functions.invoke('mcp-client', {
        body: {
          action: 'get_resource',
          sessionId: session.sessionId,
          uri,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Resource fetch failed');
      }

      console.log('✅ MCP: Resource retrieved successfully');
      return data.resource;
    } catch (error) {
      console.error('❌ MCP: Resource fetch failed:', error);
      return null;
    }
  }, [session, isConnected]);

  const disconnect = useCallback(async () => {
    if (session) {
      try {
        await supabase.functions.invoke('mcp-client', {
          body: {
            action: 'disconnect',
            sessionId: session.sessionId,
          },
        });
      } catch (error) {
        console.warn('MCP disconnect warning:', error);
      }
    }

    setSession(null);
    setTools([]);
    setResources([]);
    setIsConnected(false);
    
    toast({
      title: "MCP Disconnected",
      description: "Session ended successfully",
    });
  }, [session, toast]);

  return {
    session,
    tools,
    resources,
    isConnected,
    isLoading,
    initializeSession,
    callTool,
    getResource,
    disconnect,
  };
}
