import { useState, useCallback, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramWebApp } from "./useTelegramWebApp";
import { toast } from "@/hooks/use-toast";

export interface ChatMessageType {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
  diamonds?: Diamond[];
  insights?: string;
  priceAnalysis?: string;
  user_id?: string;
  created_at?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedDiamonds, setSuggestedDiamonds] = useState<Diamond[]>([]);
  const { user } = useTelegramWebApp();

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello${user?.first_name ? ` ${user.first_name}` : ''}! 👋\n\nI'm your AI diamond assistant. I can help you:\n\n💎 Find diamonds by your criteria\n📊 Get market insights and pricing\n💰 Compare investment options\n🔍 Analyze diamond quality\n📈 Track market trends\n\nWhat can I help you with today?`,
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Mark user message as sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );

      // Call the AI chat function
      const { data, error } = await supabase.functions.invoke('diamond-chat-ai', {
        body: {
          message: content,
          userId: user?.id,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) {
        throw error;
      }

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date().toISOString(),
        diamonds: data.recommendedDiamonds || [],
        insights: data.marketInsights,
        priceAnalysis: data.priceAnalysis
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update suggested diamonds if provided
      if (data.recommendedDiamonds && data.recommendedDiamonds.length > 0) {
        setSuggestedDiamonds(data.recommendedDiamonds);
      }

      // Store conversation in database for analytics
      if (user?.id) {
        await supabase.from('chat_conversations').insert({
          telegram_id: user.id,
          is_active: true,
          session_title: content.slice(0, 50) + (content.length > 50 ? '...' : '')
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Mark user message as error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      // Add error message
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, user]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestedDiamonds([]);
  }, []);

  const regenerateResponse = useCallback(async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (!previousUserMessage || previousUserMessage.role !== 'user') return;

    // Remove the assistant message and regenerate
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    await sendMessage(previousUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    isTyping,
    suggestedDiamonds,
    sendMessage,
    clearChat,
    regenerateResponse
  };
}