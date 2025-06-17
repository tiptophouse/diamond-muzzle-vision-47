
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useUserActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (telegramId: number, message: string) => {
    setIsLoading(true);
    try {
      // Insert notification record
      const { error } = await supabase
        .from('notifications')
        .insert({
          telegram_id: telegramId,
          message_content: message,
          message_type: 'admin_message',
          status: 'sent'
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: `Message sent to user ${telegramId}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (telegramId: number, updates: Record<string, any>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('telegram_id', telegramId);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: `User ${telegramId} has been updated`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    updateUser,
    isLoading,
  };
}
