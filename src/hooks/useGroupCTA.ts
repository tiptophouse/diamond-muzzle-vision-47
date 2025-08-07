
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GroupCTAOptions {
  message?: string;
  buttonText?: string;
  groupId?: string | number;
}

export function useGroupCTA() {
  const [isLoading, setIsLoading] = useState(false);

  const sendGroupCTA = async (options: GroupCTAOptions = {}) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Sending group CTA message...');
      
      const { data, error } = await supabase.functions.invoke('send-group-cta', {
        body: {
          message: options.message,
          buttonText: options.buttonText,
          groupId: options.groupId || -1001009290613
        }
      });

      if (error) {
        console.error('❌ Error sending group CTA:', error);
        toast({
          title: "Error",
          description: "Failed to send group call-to-action message",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Group CTA sent successfully:', data);
      toast({
        title: "Success",
        description: "Group call-to-action message sent successfully!",
      });
      
      return true;
    } catch (err) {
      console.error('❌ Group CTA hook error:', err);
      toast({
        title: "Error",
        description: "Failed to send group message",
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
