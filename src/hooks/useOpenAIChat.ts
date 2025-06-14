
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
      console.log('🤖 Sending message to OpenAI chat function. History length:', messages.length);
      
      const { data, error: functionInvokeError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: content,
          user_id: userId,
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
      });

      console.log('🤖 OpenAI function response received:', { data, functionInvokeError });

      if (functionInvokeError) {
        // This error occurs if the Supabase function itself fails to execute (e.g., network issue, function crash)
        console.error('🤖 Supabase function invocation error:', functionInvokeError);
        throw functionInvokeError;
      }

      // The edge function is designed to always return a `response` string.
      const responseContent = data?.response || 'I apologize, but I encountered an unexpected issue. Please try again.';
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // If the function returned a specific error message, show it in a toast for debugging.
      if (data?.error) {
        console.error('🤖 OpenAI function returned an error message:', data.error);
        toast({
          title: "AI Assistant Issue",
          description: `The AI returned an error: ${data.error}. You can continue chatting with fallback responses.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      // This catch block handles network errors or if the function invoke fails completely.
      console.error('🤖 Chat hook error:', error);
      
      const errorMessageText = 'I\'m currently offline. Please check your internet connection and try again. As your diamond assistant, I can help with grading, pricing, and more once I\'m back online.';
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Could not reach the AI assistant. Please check your network connection.",
        variant: "destructive",
      });
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
