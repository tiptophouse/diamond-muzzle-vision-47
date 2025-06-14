
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function useOpenAIChat(userId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('🤖 Sending message to OpenAI chat function');
      
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: content,
          user_id: userId,
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
      });

      console.log('🤖 OpenAI function response:', { data, error });

      let responseContent = 'I apologize, but I encountered an issue processing your request. Please try again.';
      
      if (data?.response) {
        responseContent = data.response;
      } else if (error) {
        console.error('🤖 Supabase function error:', error);
        responseContent = 'I\'m experiencing connection issues. Please try again in a moment.';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Only show error toast for actual failures, not fallback responses
      if (error && !data?.response) {
        toast({
          title: "Connection Issue",
          description: "The AI assistant is having connectivity issues, but you can still chat with fallback responses.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('🤖 Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m currently offline, but I\'m here to help! As your diamond assistant, I can typically help with diamond grading, pricing, inventory management, and general diamond knowledge. Please try asking your question again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages,
  };
}
