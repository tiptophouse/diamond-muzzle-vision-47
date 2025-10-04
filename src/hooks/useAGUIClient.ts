import { useState, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

// AG-UI Event Types for Diamond Agents
export interface StreamingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent_used?: string;
  isStreaming?: boolean;
  complete?: boolean;
}

export interface AgentEvent {
  type: 'message' | 'thinking' | 'tool_call' | 'agent_switch' | 'error' | 'complete';
  data: any;
  timestamp: string;
}

export type AgentType = 'main' | 'grading' | 'inventory' | 'pricing' | 'customer_service' | 'business_intelligence' | 'operations';

export interface AgentCapabilities {
  name: string;
  description: string;
  icon: string;
  expertise: string[];
}

export const AGENT_TYPES: Record<AgentType, AgentCapabilities> = {
  main: {
    name: 'Diamond Consultant Coordinator',
    description: 'Routes queries to appropriate specialists and provides comprehensive consultation',
    icon: '💎',
    expertise: ['Query routing', 'General consultation', 'Multi-specialist coordination']
  },
  grading: {
    name: 'Diamond Grading Expert',
    description: 'Certified gemologist specializing in 4Cs grading and certificate analysis',
    icon: '🔍',
    expertise: ['4Cs Grading', 'Certificate Analysis', 'Quality Assessment', 'Authenticity Verification']
  },
  inventory: {
    name: 'Inventory Management Expert',
    description: 'Analyzes portfolios and provides strategic inventory optimization',
    icon: '📊',
    expertise: ['Portfolio Analysis', 'Stock Optimization', 'Performance Metrics', 'Investment Strategy']
  },
  pricing: {
    name: 'Pricing Expert',
    description: 'Market analyst providing valuations and pricing strategies',
    icon: '💰',
    expertise: ['Market Valuations', 'Pricing Strategy', 'ROI Analysis', 'Market Trends']
  },
  customer_service: {
    name: 'Customer Service Expert',
    description: 'Specialist in customer consultation and personalized recommendations',
    icon: '🤝',
    expertise: ['Customer Education', 'Personalized Recommendations', 'Sales Support', 'Relationship Building']
  },
  business_intelligence: {
    name: 'Business Intelligence Expert',
    description: 'Daily insights, analytics, and strategic business recommendations',
    icon: '📈',
    expertise: ['Daily Reports', 'Search Analytics', 'Business Insights', 'Performance Tracking', 'Sold Diamond Detection']
  },
  operations: {
    name: 'Inventory Operations Expert',
    description: 'CRUD operations, data management, and mobile-friendly diamond operations',
    icon: '⚙️',
    expertise: ['Add Diamonds', 'Edit Records', 'Delete Stones', 'Batch Operations', 'Data Validation']
  }
};

/**
 * Enhanced AG-UI client for Diamond Agents with streaming support
 * Optimized for Telegram Mini App with haptic feedback
 */
export function useAGUIClient() {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('main');
  const [agentThinking, setAgentThinking] = useState(false);
  
  const { user } = useTelegramAuth();
  const { selectionChanged, impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Stream agent response using Server-Sent Events
   * Implements AG-UI protocol for real-time communication
   */
  const streamAgentResponse = useCallback(async (
    message: string, 
    agentType: AgentType,
    conversationHistory: StreamingMessage[]
  ): Promise<void> => {
    if (!user) {
      notificationOccurred('error');
      toast({
        title: "Authentication Required",
        description: "Please authenticate with Telegram to use diamond agents.",
        variant: "destructive",
      });
      return;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setIsStreaming(true);
      setAgentThinking(true);
      impactOccurred('medium');

      // Create streaming message
      const streamingMessageId = Date.now().toString();
      const assistantMessage: StreamingMessage = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        agent_used: agentType,
        isStreaming: true,
        complete: false,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Prepare AG-UI compatible payload
      const agentPayload = {
        message,
        user_id: user.id,
        agent_type: agentType,
        conversation_history: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          agent_used: msg.agent_used
        })),
        stream: true,
        telegram_user: {
          id: user.id,
          first_name: user.first_name,
          username: user.username
        }
      };

      // Use Supabase Edge Function with streaming support
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diamond-agents-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(agentPayload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setAgentThinking(false);
      selectionChanged();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              // Parse AG-UI event
              const event: AgentEvent = JSON.parse(line);
              
              switch (event.type) {
                case 'message':
                  // Update streaming message content
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageId 
                      ? { 
                          ...msg, 
                          content: msg.content + event.data.content,
                          isStreaming: true 
                        }
                      : msg
                  ));
                  break;

                case 'thinking':
                  setAgentThinking(true);
                  break;

                case 'agent_switch':
                  const newAgent = event.data.agent as AgentType;
                  setCurrentAgent(newAgent);
                  impactOccurred('light');
                  toast({
                    title: `Switched to ${AGENT_TYPES[newAgent].icon} ${AGENT_TYPES[newAgent].name}`,
                    description: AGENT_TYPES[newAgent].description,
                  });
                  break;

                case 'complete':
                  // Mark message as complete
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageId 
                      ? { 
                          ...msg, 
                          isStreaming: false,
                          complete: true 
                        }
                      : msg
                  ));
                  setAgentThinking(false);
                  notificationOccurred('success');
                  
                  // Success feedback
                  const agent = AGENT_TYPES[agentType];
                  toast({
                    title: `${agent.icon} ${agent.name}`,
                    description: `Response generated with specialized diamond expertise.`,
                  });
                  break;

                case 'error':
                  throw new Error(event.data.message || 'Agent processing error');
              }
            } catch (parseError) {
              console.warn('Failed to parse event:', line, parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      console.error('AG-UI streaming error:', error);
      
      if (error.name === 'AbortError') {
        // Request was cancelled
        setMessages(prev => prev.filter(msg => msg.id !== (Date.now().toString())));
        return;
      }

      setAgentThinking(false);
      notificationOccurred('error');

      // Fallback message on error
      const errorMessage: StreamingMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m currently experiencing connection issues. Please check your internet and try again. As your diamond consultant, I\'m here to help with grading, pricing, inventory analysis, and more.',
        timestamp: new Date().toISOString(),
        agent_used: agentType,
        isStreaming: false,
        complete: true,
      };

      setMessages(prev => [...prev.filter(msg => !msg.isStreaming), errorMessage]);

      toast({
        title: "Connection Error",
        description: "Could not reach the diamond agents. Please check your network.",
        variant: "destructive",
      });

    } finally {
      setIsStreaming(false);
      setAgentThinking(false);
      abortControllerRef.current = null;
    }
  }, [user, impactOccurred, notificationOccurred, selectionChanged]);

  /**
   * Send message to agent with AG-UI streaming
   */
  const sendMessage = useCallback(async (content: string, agentType: AgentType = 'main'): Promise<void> => {
    if (!content.trim()) return;

    selectionChanged();

    // Add user message immediately
    const userMessage: StreamingMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isStreaming: false,
      complete: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentAgent(agentType);

    // Stream agent response
    await streamAgentResponse(content, agentType, [...messages, userMessage]);
  }, [messages, streamAgentResponse, selectionChanged]);

  /**
   * Switch to different agent
   */
  const switchAgent = useCallback((agentType: AgentType) => {
    setCurrentAgent(agentType);
    selectionChanged();
    
    toast({
      title: `Switched to ${AGENT_TYPES[agentType].icon} ${AGENT_TYPES[agentType].name}`,
      description: AGENT_TYPES[agentType].description,
    });
  }, [selectionChanged]);

  /**
   * Clear conversation
   */
  const clearMessages = useCallback(() => {
    // Cancel any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setMessages([]);
    setCurrentAgent('main');
    setIsStreaming(false);
    setAgentThinking(false);
    impactOccurred('light');
  }, [impactOccurred]);

  /**
   * Stop current streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setAgentThinking(false);
      impactOccurred('medium');
      
      toast({
        title: "Streaming Stopped",
        description: "Agent response was cancelled.",
      });
    }
  }, [impactOccurred]);

  const getAgentContext = useCallback((agentType: AgentType) => {
    return AGENT_TYPES[agentType];
  }, []);

  return {
    // State
    messages,
    isStreaming,
    isConnected,
    currentAgent,
    agentThinking,
    
    // Actions  
    sendMessage,
    switchAgent,
    clearMessages,
    stopStreaming,
    
    // Utilities
    getAgentContext,
    availableAgents: AGENT_TYPES,
    user,
  };
}