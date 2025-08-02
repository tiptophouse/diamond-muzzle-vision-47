
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BulkUploadData {
  diamondCount: number;
  uploadType: 'csv' | 'manual';
}

export function useBulkUploadNotifications() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const sendBulkUploadNotification = useCallback(async (data: BulkUploadData) => {
    if (!user?.id || !user?.first_name) {
      console.warn('⚠️ User not authenticated, skipping notification');
      return false;
    }

    try {
      console.log('📤 Sending bulk upload notification:', data);
      
      const { data: result, error } = await supabase.functions.invoke('send-bulk-upload-notification', {
        body: {
          userId: user.id,
          userName: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
          diamondCount: data.diamondCount,
          uploadType: data.uploadType,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('❌ Failed to send bulk upload notification:', error);
        return false;
      }

      console.log('✅ Bulk upload notification result:', result);
      
      // Show success message to user if notification was sent
      if (result?.notificationSent && result?.diamondCount > 80) {
        toast({
          title: "🎉 Community Notified!",
          description: `Your upload of ${result.diamondCount} diamonds has been announced to the trading group!`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error sending bulk upload notification:', error);
      return false;
    }
  }, [user, toast]);

  return { sendBulkUploadNotification };
}
