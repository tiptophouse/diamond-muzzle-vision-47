
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  telegram_id: number;
  first_name: string;
  language_code?: string;
}

export function useWelcomeMessage() {
  const { toast } = useToast();
  const sentMessagesRef = useRef(new Set<number>());

  const sendWelcomeMessage = useCallback(async (user: User, isNewUser: boolean = true) => {
    try {
      // Prevent duplicate sends in the same session
      if (sentMessagesRef.current.has(user.telegram_id)) {
        console.log('⚠️ Welcome message already sent to user in this session:', user.telegram_id);
        return { success: true, data: null };
      }

      console.log('🚀 Sending welcome message to:', user.first_name);
      
      const { data, error } = await supabase.functions.invoke('send-welcome-message', {
        body: {
          user,
          isNewUser
        }
      });

      if (error) {
        console.error('❌ Error sending welcome message:', error);
        throw error;
      }

      console.log('✅ Welcome message sent successfully:', data);
      
      // Mark as sent in this session
      sentMessagesRef.current.add(user.telegram_id);
      
      toast({
        title: 'Welcome Message Sent',
        description: `Welcome message sent to ${user.first_name}`,
      });

      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to send welcome message:', error);
      
      toast({
        title: 'Error Sending Welcome Message',
        description: 'Failed to send welcome message to user',
        variant: 'destructive',
      });

      return { success: false, error };
    }
  }, [toast]);

  const sendBulkWelcomeMessages = useCallback(async (users: User[]) => {
    const results = [];
    
    for (const user of users) {
      try {
        const result = await sendWelcomeMessage(user, true);
        results.push({ user: user.telegram_id, success: result.success });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to send welcome message to ${user.telegram_id}:`, error);
        results.push({ user: user.telegram_id, success: false, error });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    toast({
      title: 'Bulk Welcome Messages Complete',
      description: `Sent ${successful} messages successfully, ${failed} failed`,
    });

    return { results, successful, failed };
  }, [sendWelcomeMessage, toast]);

  return {
    sendWelcomeMessage,
    sendBulkWelcomeMessages
  };
}
