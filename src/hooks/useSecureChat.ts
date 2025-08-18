
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureUser } from '@/contexts/SecureUserContext';
import { toast } from '@/components/ui/use-toast';

interface SecureChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  user_id: string;
}

export function useSecureChat() {
  const [messages, setMessages] = useState<SecureChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUserId, isUserVerified } = useSecureUser();

  const sendMessage = async (content: string): Promise<void> => {
    if (!currentUserId || !isUserVerified) {
      toast({
        title: "Access Denied",
        description: "User verification required for chat",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message with secure user isolation
      const userMessage: SecureChatMessage = {
        id: crypto.randomUUID(),
        content,
        role: 'user',
        created_at: new Date().toISOString(),
        user_id: currentUserId.toString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Store in database with user isolation
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content,
          role: 'user',
          telegram_id: currentUserId,
          user_id: currentUserId.toString()
        });

      if (error) {
        console.error('❌ Error saving chat message:', error);
        // Remove message from UI if save failed
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        toast({
          title: "Error",
          description: "Failed to save message securely",
          variant: "destructive"
        });
        return;
      }

      // Simulate AI response (replace with actual OpenAI call)
      setTimeout(() => {
        const aiMessage: SecureChatMessage = {
          id: crypto.randomUUID(),
          content: "I'm your secure diamond assistant. Your data is completely isolated and private.",
          role: 'assistant',
          created_at: new Date().toISOString(),
          user_id: currentUserId.toString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);

    } catch (error) {
      console.error('❌ Error in secure chat:', error);
      toast({
        title: "Security Error",
        description: "Chat security violation detected",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserMessages = async () => {
    if (!currentUserId || !isUserVerified) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('telegram_id', currentUserId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Security check: ensure all messages belong to current user
      const userMessages = (data || []).filter(msg => 
        msg.telegram_id === currentUserId
      );

      setMessages(userMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        created_at: msg.created_at,
        user_id: msg.user_id || currentUserId.toString()
      })));

    } catch (error) {
      console.error('❌ Error loading user messages:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    loadUserMessages();
  }, [currentUserId, isUserVerified]);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    user: currentUserId ? { id: currentUserId } : null
  };
}
