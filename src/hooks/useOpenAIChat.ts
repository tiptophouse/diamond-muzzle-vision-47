
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const OPENAI_API_KEY = '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';

export function useOpenAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '💎 Welcome to Diamond Assistant! I\'m here to help you with inventory management, pricing analysis, market insights, and any diamond-related questions. How can I assist you today?',
      timestamp: new Date().toISOString(),
    }
  ]);
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
      console.log('Sending message to OpenAI API:', content);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a Diamond Assistant, an expert AI specialized in diamond inventory management, market analysis, pricing, and trading. You help users with diamond-related questions, inventory management, market insights, pricing analysis, quality assessment, and investment recommendations. Always provide helpful, accurate, and professional responses related to the diamond industry.'
            },
            ...messages
              .filter(msg => msg.id !== 'welcome')
              .map(msg => ({
                role: msg.role,
                content: msg.content
              })),
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      console.log('OpenAI API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenAI API Response data:', data);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'I apologize, but I didn\'t receive a proper response. Could you please try asking your question again?',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error details:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m currently experiencing connection issues. As your Diamond Assistant, I can help with:\n\n• Diamond inventory management\n• Market pricing analysis\n• Quality assessment and grading\n• Investment recommendations\n• Market trends and insights\n\nPlease try your question again in a moment.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "Unable to connect to the AI service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '💎 Welcome back to Diamond Assistant! How can I help you today?',
      timestamp: new Date().toISOString(),
    }]);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    clearMessages,
  };
}
