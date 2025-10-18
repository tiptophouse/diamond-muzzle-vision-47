import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setIsLoading(true);

      // Fetch recent activities from multiple sources
      const [
        recentUsers,
        recentDiamonds,
        recentNotifications,
        recentBlocks
      ] = await Promise.all([
        // Recent user registrations
        supabase
          .from('user_profiles')
          .select('telegram_id, first_name, last_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent diamond uploads
        supabase
          .from('inventory')
          .select('stock_number, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent notifications sent
        supabase
          .from('notifications')
          .select('id, message_content, sent_at')
          .order('sent_at', { ascending: false })
          .limit(5),

        // Recent user blocks
        supabase
          .from('blocked_users')
          .select('telegram_id, reason, created_at')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const allActivities: Activity[] = [];

      // Process user registrations
      if (recentUsers.data) {
        recentUsers.data.forEach(user => {
          allActivities.push({
            id: `user-${user.telegram_id}`,
            type: 'user_registration',
            title: 'New User Registration',
            description: `${user.first_name} ${user.last_name || ''} joined`,
            timestamp: user.created_at
          });
        });
      }

      // Process diamond uploads
      if (recentDiamonds.data) {
        recentDiamonds.data.forEach(diamond => {
          allActivities.push({
            id: `diamond-${diamond.stock_number}`,
            type: 'diamond_upload',
            title: 'Diamond Uploaded',
            description: `Stock #${diamond.stock_number} added`,
            timestamp: diamond.created_at
          });
        });
      }

      // Process notifications
      if (recentNotifications.data) {
        recentNotifications.data.forEach(notification => {
          allActivities.push({
            id: `notification-${notification.id}`,
            type: 'notification_sent',
            title: 'Notification Sent',
            description: notification.message_content.substring(0, 50) + '...',
            timestamp: notification.sent_at
          });
        });
      }

      // Process blocks
      if (recentBlocks.data) {
        recentBlocks.data.forEach(block => {
          allActivities.push({
            id: `block-${block.telegram_id}`,
            type: 'user_blocked',
            title: 'User Blocked',
            description: `User ${block.telegram_id} - ${block.reason || 'No reason'}`,
            timestamp: block.created_at
          });
        });
      }

      // Sort all activities by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activities,
    isLoading,
    refetch: fetchRecentActivity
  };
}
