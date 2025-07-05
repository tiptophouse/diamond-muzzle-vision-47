
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function useOpenAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate with Telegram to use the chat.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('🤖 Sending message to OpenAI chat function for user:', user.id);
      console.log('🤖 Message:', content);
      console.log('🤖 History length:', messages.length);
      
      const { data, error: functionInvokeError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: content,
          user_id: user.id,
          conversation_history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
      });

      console.log('🤖 OpenAI function response received:', { data, functionInvokeError });

      if (functionInvokeError) {
        console.error('🤖 Supabase function invocation error:', functionInvokeError);
        throw functionInvokeError;
      }

      const responseContent = data?.response || 'I apologize, but I encountered an unexpected issue. Please try again.';
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Show success toast for successful responses
      if (data?.success && !data?.error) {
        toast({
          title: "💎 Diamond Assistant",
          description: "Response generated with live inventory data",
        });
      }
      
      if (data?.error && !data?.success) {
        console.error('🤖 OpenAI function returned an error:', data.error);
        toast({
          title: "⚠️ AI Assistant Issue",
          description: `Service issue: ${data.error}. Please check your configuration.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('🤖 Chat hook error:', error);
      
      const errorMessageText = `I'm currently offline due to a technical issue. Please check the following:

🔧 **Configuration Check:**
• OpenAI API key is set in Supabase Edge Function Secrets
• BACKEND_URL points to your FastAPI server  
• BACKEND_ACCESS_TOKEN is configured correctly
• Your FastAPI backend is running and accessible

As your diamond assistant, I can help with grading, pricing, inventory analysis, and market insights once I'm reconnected. Please try again in a moment.

**Technical details:** ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "🔌 Connection Error",
        description: "Could not reach the AI assistant. Please check your network connection and configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Started a new conversation",
    });
  };

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages,
    user,
  };
}
