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

      // Use Supabase Edge Function - simplified for now
      const response = await fetch(`https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/diamond-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaGxqcWd4aGRoYmJocG9oeGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODY1NTMsImV4cCI6MjA2MzA2MjU1M30._CGnKnTyltp1lIUmmOVI1nC4jRew2WkAU-bSf22HCDE`,
        },
        body: JSON.stringify(agentPayload),
        signal: abortControllerRef.current.signal,
      });

      // Handle regular JSON response for now (simplified)
      const result = await response.json();
      
      setAgentThinking(false);
      selectionChanged();

      if (result.error) {
        throw new Error(result.error);
      }

      // Update the streaming message with final content
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? { 
              ...msg, 
              content: result.response || 'No response received',
              isStreaming: false,
              complete: true 
            }
          : msg
      ));

      notificationOccurred('success');
      
      // Success feedback
      const agent = AGENT_TYPES[agentType];
      toast({
        title: `${agent.icon} ${agent.name}`,
        description: `Response generated with specialized diamond expertise.`,
      });

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