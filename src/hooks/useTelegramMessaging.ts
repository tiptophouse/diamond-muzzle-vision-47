import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface SendMessageOptions {
  telegramId: number;
  message: string;
  diamondDetails?: {
    stock_number: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    price_per_carat: number;
  };
}

export function useTelegramMessaging() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const sendMessage = useCallback(async (options: SendMessageOptions) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const messageContent = options.diamondDetails 
        ? `${options.message}\n\n💎 Diamond Details:\n${options.diamondDetails.shape} ${options.diamondDetails.weight}ct ${options.diamondDetails.color} ${options.diamondDetails.clarity}\nStock: ${options.diamondDetails.stock_number}\nPrice: $${(options.diamondDetails.price_per_carat * options.diamondDetails.weight).toLocaleString()}`
        : options.message;

      const { error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: options.telegramId,
          message: messageContent,
          senderId: user.id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send Message",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  return {
    sendMessage,
    isLoading
  };
}