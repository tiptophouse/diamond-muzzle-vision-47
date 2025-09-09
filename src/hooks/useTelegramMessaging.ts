import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MessageOptions {
  message: string;
  buttons?: Array<{
    text: string;
    url: string;
  }>;
}

export function useTelegramMessaging() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { notificationOccurred, impactOccurred } = useTelegramHapticFeedback();

  const sendDirectMessage = useCallback(async (
    telegramId: number, 
    options: MessageOptions
  ): Promise<boolean> => {
    setIsSending(true);
    impactOccurred('medium');

    try {
      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId,
          message: options.message,
          buttons: options.buttons
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Failed to Send Message",
          description: "Could not send the message. Please try again.",
          variant: "destructive"
        });
        notificationOccurred('error');
        return false;
      }

      toast({
        title: "Message Sent",
        description: `Message sent successfully to user ${telegramId}`,
      });
      notificationOccurred('success');
      return true;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send Message",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      notificationOccurred('error');
      return false;

    } finally {
      setIsSending(false);
    }
  }, [toast, notificationOccurred, impactOccurred]);

  const sendDiamondInquiry = useCallback(async (
    telegramId: number,
    diamond: any,
    customMessage?: string
  ): Promise<boolean> => {
    const price = diamond.total_price || (diamond.price_per_carat * diamond.weight);
    const formattedPrice = price.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    });

    const message = customMessage || 
      `💎 Hello! I have a ${diamond.shape} diamond that matches your search:\n\n` +
      `📋 Details:\n` +
      `• Shape: ${diamond.shape}\n` +
      `• Weight: ${diamond.weight}ct\n` +
      `• Color: ${diamond.color}\n` +
      `• Clarity: ${diamond.clarity}\n` +
      `• Price: ${formattedPrice}\n` +
      `• Stock #: ${diamond.stock_number}\n\n` +
      `Would you like more information or photos?`;

    return await sendDirectMessage(telegramId, { message });
  }, [sendDirectMessage]);

  const sendQuickReply = useCallback(async (
    telegramId: number,
    replyMessage: string
  ): Promise<boolean> => {
    return await sendDirectMessage(telegramId, { message: replyMessage });
  }, [sendDirectMessage]);

  return {
    sendDirectMessage,
    sendDiamondInquiry,
    sendQuickReply,
    isSending
  };
}