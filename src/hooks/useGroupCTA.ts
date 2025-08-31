
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GroupCTAOptions {
  message?: string;
  groupId?: string | number;
  botUsername?: string;
  useMultipleButtons?: boolean;
  includePremiumButton?: boolean;
  includeInventoryButton?: boolean;
  includeChatButton?: boolean;
}

export function useGroupCTA() {
  const [isLoading, setIsLoading] = useState(false);

  const sendGroupCTA = async (options: GroupCTAOptions = {}) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Sending enhanced group CTA message...');
      
      const { data, error } = await supabase.functions.invoke('send-group-cta', {
        body: {
          message: options.message,
          groupId: options.groupId || -1001009290613,
          botUsername: options.botUsername,
          useMultipleButtons: options.useMultipleButtons ?? true,
          includePremiumButton: options.includePremiumButton ?? true,
          includeInventoryButton: options.includeInventoryButton ?? true,
          includeChatButton: options.includeChatButton ?? true
        }
      });

      if (error) {
        console.error('❌ Error sending enhanced group CTA:', error);
        toast({
          title: "Error",
          description: "Failed to send enhanced group call-to-action message",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Enhanced Group CTA sent successfully:', data);
      
      const buttonCount = data?.buttonsCount || 1;
      const features = data?.features || {};
      
      toast({
        title: "Success! 🚀",
        description: `Enhanced group CTA sent with ${buttonCount} button rows and multiple engagement options!`,
      });
      
      return true;
    } catch (err) {
      console.error('❌ Enhanced Group CTA hook error:', err);
      toast({
        title: "Error",
        description: "Failed to send enhanced group message",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendGroupCTA,
    isLoading
  };
}
