
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MCPSession, MCPTool, MCPResource, MCPToolCall, MCPToolResult } from '@/lib/mcp/types';

const ADMIN_TELEGRAM_ID = 2138564172;

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

    // CRITICAL SECURITY: Only allow admin access
    if (user.id !== ADMIN_TELEGRAM_ID) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "MCP is restricted to authorized administrators only",
      });
      console.log('❌ MCP: Access denied for user:', user.id, 'Admin ID:', ADMIN_TELEGRAM_ID);
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔄 MCP: Initializing secure admin session...');
      
      const { data, error } = await supabase.functions.invoke('mcp-client', {
        body: {
          action: 'initialize',
          userId: user.id.toString(),
          clientInfo: {
            name: 'Mazalbot-Admin-Web',
            version: '1.0.0'
          }
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize secure MCP session');
      }

      setSession(data.session);
      setTools(data.tools || []);
      setResources(data.resources || []);
      setIsConnected(true);

      console.log('✅ MCP: Secure admin session initialized successfully');
      toast({
        title: "MCP Connected",
        description: "Secure admin access to Model Context Protocol established",
      });

      return true;
    } catch (error) {
      console.error('❌ MCP: Secure session initialization failed:', error);
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

    if (user?.id !== ADMIN_TELEGRAM_ID) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Admin access required for tool execution",
      });
      return null;
    }

    try {
      console.log('🛠️ MCP: Admin calling tool:', toolCall.name);
      
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

      console.log('✅ MCP: Admin tool call successful');
      return data.result;
    } catch (error) {
      console.error('❌ MCP: Admin tool call failed:', error);
      toast({
        variant: "destructive",
        title: "Tool Call Failed",
        description: error instanceof Error ? error.message : "Failed to execute tool",
      });
      return null;
    }
  }, [session, isConnected, user?.id, toast]);

  const getResource = useCallback(async (uri: string): Promise<any | null> => {
    if (!session || !isConnected) {
      return null;
    }

    if (user?.id !== ADMIN_TELEGRAM_ID) {
      return null;
    }

    try {
      console.log('📄 MCP: Admin getting resource:', uri);
      
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

      console.log('✅ MCP: Admin resource retrieved successfully');
      return data.resource;
    } catch (error) {
      console.error('❌ MCP: Admin resource fetch failed:', error);
      return null;
    }
  }, [session, isConnected, user?.id]);

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
      description: "Admin session ended successfully",
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
