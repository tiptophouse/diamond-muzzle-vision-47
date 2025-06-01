
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useChatMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Convert data to match our interface
      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        session_id: msg.session_id || '',
        user_id: msg.user_id || '',
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at || new Date().toISOString(),
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = async (content: string, role: 'user' | 'assistant', userId: string): Promise<ChatMessage | null> => {
    if (!sessionId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newMessage: ChatMessage = {
        id: data.id,
        session_id: data.session_id || '',
        user_id: data.user_id || '',
        role: data.role as 'user' | 'assistant',
        content: data.content,
        created_at: data.created_at || new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  return {
    messages,
    addMessage,
    isLoading,
    refetch: fetchMessages,
  };
}
