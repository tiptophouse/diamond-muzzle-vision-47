import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface ChatbotMessage {
  id: string;
  telegram_id: number;
  message_text: string;
  chat_id: number;
  chat_type: string;
  chat_title?: string;
  sender_info: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  parsed_data?: {
    shape?: string;
    carat_min?: number;
    carat_max?: number;
    color?: string;
    clarity?: string;
    price_max?: number;
    keywords: string[];
    confidence: number;
  };
  confidence_score: number;
  message_timestamp: string;
  created_at: string;
  processed: boolean;
}

export function useChatbotMessageListener() {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  // Fetch all incoming messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .order('message_timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform and type-cast the data
      const transformedMessages: ChatbotMessage[] = (data || []).map(message => ({
        id: message.id,
        telegram_id: message.telegram_id,
        message_text: message.message_text,
        chat_id: message.chat_id,
        chat_type: message.chat_type,
        chat_title: message.chat_title,
        sender_info: message.sender_info as {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
        },
        parsed_data: message.parsed_data as {
          shape?: string;
          carat_min?: number;
          carat_max?: number;
          color?: string;
          clarity?: string;
          price_max?: number;
          keywords: string[];
          confidence: number;
        } | undefined,
        confidence_score: message.confidence_score,
        message_timestamp: message.message_timestamp,
        created_at: message.created_at,
        processed: message.processed
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching chatbot messages:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון הודעות מהצ'אטבוט",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark message as processed
  const markAsProcessed = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_messages')
        .update({ processed: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, processed: true } : msg
        )
      );

      toast({
        title: "הודעה סומנה כמעובדת",
        description: "ההודעה סומנה בהצלחה כמעובדת",
      });
    } catch (error) {
      console.error('Error marking message as processed:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לסמן הודעה כמעובדת",
        variant: "destructive",
      });
    }
  };

  // Filter messages by confidence score
  const getHighConfidenceMessages = () => {
    return messages.filter(msg => msg.confidence_score >= 0.5);
  };

  // Get unprocessed messages
  const getUnprocessedMessages = () => {
    return messages.filter(msg => !msg.processed);
  };

  // Get diamond request messages
  const getDiamondRequests = () => {
    return messages.filter(msg => 
      msg.parsed_data && 
      msg.confidence_score >= 0.3 && 
      msg.parsed_data.keywords.length > 0
    );
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('chatbot_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_messages'
        },
        (payload) => {
          console.log('📨 New chatbot message received:', payload);
          
          const rawMessage = payload.new;
          const newMessage: ChatbotMessage = {
            id: rawMessage.id,
            telegram_id: rawMessage.telegram_id,
            message_text: rawMessage.message_text,
            chat_id: rawMessage.chat_id,
            chat_type: rawMessage.chat_type,
            chat_title: rawMessage.chat_title,
            sender_info: rawMessage.sender_info as {
              id: number;
              first_name: string;
              last_name?: string;
              username?: string;
            },
            parsed_data: rawMessage.parsed_data as {
              shape?: string;
              carat_min?: number;
              carat_max?: number;
              color?: string;
              clarity?: string;
              price_max?: number;
              keywords: string[];
              confidence: number;
            } | undefined,
            confidence_score: rawMessage.confidence_score,
            message_timestamp: rawMessage.message_timestamp,
            created_at: rawMessage.created_at,
            processed: rawMessage.processed
          };
          
          setMessages(prev => [newMessage, ...prev]);

          // Show real-time toast for high confidence messages
          if (newMessage.confidence_score >= 0.5) {
            toast({
              title: "🔍 בקשת יהלום חדשה!",
              description: `${newMessage.sender_info.first_name} חיפש: ${newMessage.message_text.substring(0, 50)}...`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    isLoading,
    markAsProcessed,
    getHighConfidenceMessages,
    getUnprocessedMessages,
    getDiamondRequests,
    refetch: fetchMessages,
  };
}