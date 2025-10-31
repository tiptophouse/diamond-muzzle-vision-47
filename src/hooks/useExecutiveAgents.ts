import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { API_BASE_URL } from '@/lib/api/config';

export interface ExecutiveMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent_used?: string;
  metrics?: Record<string, any>;
}

export type ExecutiveAgentType = 'cto' | 'ceo' | 'marketing';

export interface ExecutiveAgentCapabilities {
  name: string;
  description: string;
  icon: string;
  expertise: string[];
  dataAccess: string[];
}

export const EXECUTIVE_AGENT_TYPES: Record<ExecutiveAgentType, ExecutiveAgentCapabilities> = {
  cto: {
    name: 'CTO Technical Advisor',
    description: 'System performance, API optimization, technical debt analysis',
    icon: '👨‍💻',
    expertise: [
      'API Performance Analysis',
      'Database Optimization',
      'System Error Detection',
      'Technical Debt Assessment',
      'Infrastructure Recommendations',
      'FastAPI Integration Health'
    ],
    dataAccess: [
      'Error logs (error_reports)',
      'API usage (bot_usage_analytics)',
      'System performance metrics',
      'FastAPI diamond data (27,000+ stones)',
      'Database query performance'
    ]
  },
  ceo: {
    name: 'CEO Business Advisor',
    description: 'Revenue insights, user growth, strategic business recommendations',
    icon: '📊',
    expertise: [
      'Revenue Analytics',
      'User Growth Trends',
      'Customer Retention',
      'Profit/Loss Analysis',
      'Strategic Recommendations',
      'Market Opportunities'
    ],
    dataAccess: [
      'User analytics (user_analytics)',
      'Revenue data (cost_tracking)',
      'Diamond inventory value (FastAPI)',
      'User engagement metrics',
      'Subscription status'
    ]
  },
  marketing: {
    name: 'Marketing Strategy Advisor',
    description: 'User engagement, campaign effectiveness, growth opportunities',
    icon: '📱',
    expertise: [
      'User Engagement Analysis',
      'Campaign Performance',
      'Diamond View Analytics',
      'Conversion Optimization',
      'Re-engagement Strategies',
      'Social Sharing Metrics'
    ],
    dataAccess: [
      'Diamond views (diamond_views)',
      'Share analytics (diamond_share_analytics)',
      'User behavior (user_behavior_analytics)',
      'Notification effectiveness',
      'Campaign results'
    ]
  }
};

export function useExecutiveAgents() {
  const [messages, setMessages] = useState<ExecutiveMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<ExecutiveAgentType>('ceo');
  const { user } = useTelegramAuth();

  const sendMessage = async (content: string, agentType: ExecutiveAgentType = 'ceo'): Promise<void> => {
    if (!content.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate to use executive agents.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ExecutiveMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentAgent(agentType);

    try {
      console.log('🎯 Executive Agent Request:', { agentType, userId: user.id, content });
      
      // Call the executive-agents edge function with enhanced context
      const { data, error: functionInvokeError } = await supabase.functions.invoke('executive-agents', {
        body: {
          message: content,
          user_id: user.id,
          agent_type: agentType,
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          context: {
            fastapi_url: `${API_BASE_URL}/api/v1/get_all_stones`,
            include_logs: true,
            include_analytics: true,
            include_realtime_data: true
          }
        },
      });

      console.log('🎯 Executive Agent Response:', { data, error: functionInvokeError });

      if (functionInvokeError) {
        console.error('🎯 Executive Agent Error:', functionInvokeError);
        throw functionInvokeError;
      }

      const responseContent = data?.response || 'I apologize, but I encountered an issue analyzing the data. Please try again.';
      
      const assistantMessage: ExecutiveMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        agent_used: data?.agent_used || agentType,
        metrics: data?.metrics || {}
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data?.error) {
        toast({
          title: "Agent Warning",
          description: data.error,
          variant: "destructive",
        });
      } else {
        const agent = EXECUTIVE_AGENT_TYPES[agentType];
        toast({
          title: `${agent.icon} ${agent.name}`,
          description: "Analysis complete with real-time data",
        });
      }

    } catch (error) {
      console.error('🎯 Executive Agent Error:', error);
      
      const errorMessageText = 'I\'m currently unable to analyze the data. Please ensure I have access to the backend systems and try again.';
      
      const errorMessage: ExecutiveMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Could not reach the executive agents system.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchAgent = (agentType: ExecutiveAgentType) => {
    setCurrentAgent(agentType);
    toast({
      title: `Switched to ${EXECUTIVE_AGENT_TYPES[agentType].icon} ${EXECUTIVE_AGENT_TYPES[agentType].name}`,
      description: EXECUTIVE_AGENT_TYPES[agentType].description,
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getAgentContext = (agentType: ExecutiveAgentType) => {
    return EXECUTIVE_AGENT_TYPES[agentType];
  };

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages,
    currentAgent,
    switchAgent,
    getAgentContext,
    availableAgents: EXECUTIVE_AGENT_TYPES,
    user,
  };
}
