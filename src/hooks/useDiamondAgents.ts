import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent_used?: string;
  turns_used?: number;
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

export function useDiamondAgents() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('main');
  const { user } = useTelegramAuth();

  const sendMessage = async (content: string, agentType: AgentType = 'main'): Promise<void> => {
    if (!content.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate with Telegram to use the diamond agents.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentAgent(agentType);

    try {
      console.log('🤖 Sending message to Diamond Agents for user:', user.id);
      console.log('🤖 Message:', content);
      console.log('🤖 Agent Type:', agentType);
      console.log('🤖 History length:', messages.length);
      
      const { data, error: functionInvokeError } = await supabase.functions.invoke('diamond-agents', {
        body: {
          message: content,
          user_id: user.id,
          agent_type: agentType,
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
      });

      console.log('🤖 Diamond Agents response received:', { data, functionInvokeError });

      if (functionInvokeError) {
        console.error('🤖 Supabase function invocation error:', functionInvokeError);
        throw functionInvokeError;
      }

      const responseContent = data?.response || 'I apologize, but I encountered an unexpected issue. Please try again.';
      
      const assistantMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        agent_used: data?.agent_used,
        turns_used: data?.turns_used,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data?.error) {
        console.error('🤖 Diamond Agents returned an error message:', data.error);
        toast({
          title: "Diamond Agent Issue",
          description: `The agent returned an error: ${data.error}. You can continue chatting with fallback responses.`,
          variant: "destructive",
        });
      } else {
        // Success feedback with agent info
        const agent = AGENT_TYPES[agentType];
        toast({
          title: `${agent.icon} ${agent.name}`,
          description: `Response generated successfully using specialized diamond expertise.`,
        });
      }

    } catch (error) {
      console.error('🤖 Diamond Agents hook error:', error);
      
      const errorMessageText = 'I\'m currently offline. Please check your internet connection and try again. As your diamond consultant, I can help with grading, pricing, inventory analysis, and more once I\'m back online.';
      
      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Could not reach the diamond agents. Please check your network connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchAgent = (agentType: AgentType) => {
    setCurrentAgent(agentType);
    toast({
      title: `Switched to ${AGENT_TYPES[agentType].icon} ${AGENT_TYPES[agentType].name}`,
      description: AGENT_TYPES[agentType].description,
    });
  };

  const clearMessages = () => {
    setMessages([]);
    setCurrentAgent('main');
  };

  const getAgentContext = (agentType: AgentType) => {
    return AGENT_TYPES[agentType];
  };

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages,
    currentAgent,
    switchAgent,
    getAgentContext,
    availableAgents: AGENT_TYPES,
    user,
  };
}