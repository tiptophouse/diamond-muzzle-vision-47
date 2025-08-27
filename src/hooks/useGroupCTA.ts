
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GroupCTAOptions {
  message?: string;
  groupId?: string | number;
  botUsername?: string;
  useButtons?: boolean;
}

export function useGroupCTA() {
  const [isLoading, setIsLoading] = useState(false);

  const sendGroupCTA = async (options: GroupCTAOptions = {}) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Sending group message...');
      
      const { data, error } = await supabase.functions.invoke('send-group-cta', {
        body: {
          message: options.message,
          groupId: options.groupId || -1001009290613,
          botUsername: options.botUsername,
          useButtons: options.useButtons ?? false
        }
      });

      if (error) {
        console.error('❌ Error sending group message:', error);
        toast({
          title: "שגיאה",
          description: "נכשל בשליחת הודעה לקבוצה",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Group message sent successfully:', data);
      
      const messageType = data?.messageType || 'text_only';
      const userCount = data?.userCount || '400+';
      
      toast({
        title: "הצלחה! 🎉",
        description: `הודעת צמיחה נשלחה לקבוצה - ${userCount} משתמשים!`,
      });
      
      return true;
    } catch (err) {
      console.error('❌ Group CTA hook error:', err);
      toast({
        title: "שגיאה",
        description: "נכשל בשליחת הודעה לקבוצה",
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
