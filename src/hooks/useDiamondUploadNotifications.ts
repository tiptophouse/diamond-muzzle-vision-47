
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface DiamondUploadData {
  diamondCount: number;
  uploadType: 'single' | 'bulk';
  groupId?: string;
}

export function useDiamondUploadNotifications() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const sendDiamondUploadNotification = useCallback(async (data: DiamondUploadData) => {
    if (!user?.id || !user?.first_name) {
      console.warn('⚠️ User not authenticated, skipping notification');
      return false;
    }

    try {
      console.log('📤 Sending diamond upload notification:', data);
      
      const { data: result, error } = await supabase.functions.invoke('send-diamond-upload-notification', {
        body: {
          userId: user.id,
          userName: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
          diamondCount: data.diamondCount,
          uploadType: data.uploadType,
          timestamp: new Date().toISOString(),
          groupId: data.groupId
        }
      });

      if (error) {
        console.error('❌ Failed to send diamond upload notification:', error);
        return false;
      }

      console.log('✅ Diamond upload notification result:', result);
      
      // Show success message to user
      if (result?.notificationSent) {
        toast({
          title: "📢 Group Notified!",
          description: `Your upload of ${result.diamondCount} diamond${result.diamondCount > 1 ? 's' : ''} has been announced to the trading group with secure store access!`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error sending diamond upload notification:', error);
      return false;
    }
  }, [user, toast]);

  return { sendDiamondUploadNotification };
}
