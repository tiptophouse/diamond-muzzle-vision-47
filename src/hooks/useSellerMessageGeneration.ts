import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GeneratedMessage {
  id: string;
  content: string;
  tone: 'professional' | 'friendly' | 'urgent';
  includedDiamonds: string[];
}

export interface MessageGenerationOptions {
  buyerName: string;
  buyerTelegramId: number;
  searchQuery: string;
  matchedDiamonds: any[];
  sellerName: string;
}

export function useSellerMessageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);

  const generateMessages = async (options: MessageGenerationOptions): Promise<GeneratedMessage[]> => {
    setIsGenerating(true);
    try {
      console.log('🤖 Generating seller messages with options:', options);

      const { data, error } = await supabase.functions.invoke('generate-seller-message', {
        body: {
          buyer_name: options.buyerName,
          buyer_telegram_id: options.buyerTelegramId,
          search_query: options.searchQuery,
          matched_diamonds: options.matchedDiamonds,
          seller_name: options.sellerName,
        },
      });

      if (error) {
        console.error('🤖 Error generating messages:', error);
        throw error;
      }

      const messages: GeneratedMessage[] = data?.messages || [];
      setGeneratedMessages(messages);
      
      toast.success('הודעות נוצרו בהצלחה!', {
        description: `נוצרו ${messages.length} הודעות`,
      });

      return messages;
    } catch (error) {
      console.error('🤖 Failed to generate messages:', error);
      toast.error('שגיאה ביצירת הודעות', {
        description: 'נסה שוב מאוחר יותר',
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessageToBuyer = async (
    buyerTelegramId: number,
    message: string,
    diamondImages?: string[]
  ): Promise<boolean> => {
    setIsSending(true);
    try {
      console.log('📤 Sending message to buyer:', buyerTelegramId);

      const { data, error } = await supabase.functions.invoke('send-seller-message', {
        body: {
          telegram_id: buyerTelegramId,
          message,
          diamond_images: diamondImages || [],
        },
      });

      if (error) {
        console.error('📤 Error sending message:', error);
        throw error;
      }

      toast.success('הודעה נשלחה בהצלחה!', {
        description: 'הלקוח יקבל את ההודעה שלך',
      });

      return true;
    } catch (error) {
      console.error('📤 Failed to send message:', error);
      toast.error('שגיאה בשליחת הודעה', {
        description: 'נסה שוב מאוחר יותר',
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    generateMessages,
    sendMessageToBuyer,
    generatedMessages,
    isGenerating,
    isSending,
  };
}
