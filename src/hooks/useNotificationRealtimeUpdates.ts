import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';

interface RealtimeNotification {
  id: string;
  telegram_id: number;
  message_type: string;
  message_content: string;
  metadata: any;
  created_at: string;
}

interface UseNotificationRealtimeUpdatesProps {
  onNewNotification: (notification: RealtimeNotification) => void;
}

export function useNotificationRealtimeUpdates({ 
  onNewNotification 
}: UseNotificationRealtimeUpdatesProps) {
  const { user } = useTelegramAuth();
  const { notificationOccurred, impactOccurred } = useTelegramHapticFeedback();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    console.log('🔴 Setting up realtime notifications for user:', user.id);

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `telegram_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔴 New notification received:', payload);
          
          const newNotification = payload.new as RealtimeNotification;
          
          // Add to notifications list
          onNewNotification(newNotification);
          
          // Haptic feedback
          notificationOccurred('success');
          impactOccurred('medium');
          
          // Show toast
          toast({
            title: "🔔 התראה חדשה!",
            description: newNotification.message_content.substring(0, 100) + '...',
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        console.log('🔴 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔴 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, onNewNotification, notificationOccurred, impactOccurred, toast]);
}
