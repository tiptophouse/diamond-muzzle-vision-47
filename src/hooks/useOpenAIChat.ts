
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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
      console.log('Sending message to Mazal API:', content);
      
      const response = await fetch('https://api.mazalbot.com/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ifj9ov1rh20fslfp',
        },
        body: JSON.stringify({
          message: content,
          conversation_history: messages
            .filter(msg => msg.id !== 'welcome') // Exclude welcome message from history
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }))
        }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || data.reply || 'I received your message, but I\'m having trouble formulating a response. Could you please rephrase your question?',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error details:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m currently experiencing connection issues. As your Diamond Assistant, I can help with:\n\n• Diamond inventory management\n• Market pricing analysis\n• Quality assessment and grading\n• Investment recommendations\n• Market trends and insights\n\nPlease try your question again in a moment, or feel free to browse your inventory while I reconnect.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      // Show a less alarming toast message
      toast({
        title: "Temporary Connection Issue",
        description: "The AI is reconnecting. Your message was saved and you can try again.",
        variant: "default",
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
