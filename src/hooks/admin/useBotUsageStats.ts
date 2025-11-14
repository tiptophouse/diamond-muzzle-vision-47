import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BotStats {
  messagesToday: number;
  activeUsersToday: number;
  commandsToday: number;
}

export function useBotUsageStats() {
  const [botStats, setBotStats] = useState<BotStats>({
    messagesToday: 0,
    activeUsersToday: 0,
    commandsToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBotStats();
  }, []);

  const fetchBotStats = async () => {
    try {
      setIsLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Try multiple data sources

      // 1. Check bot_usage_analytics (preferred)
      const { data: botUsage } = await supabase
        .from('bot_usage_analytics')
        .select('telegram_id, message_type, command')
        .gte('created_at', today.toISOString());

      // 2. Check notifications for today
      const { data: notifications } = await supabase
        .from('notifications')
        .select('telegram_id, message_type')
        .gte('created_at', today.toISOString());

      // 3. Check user_analytics for active users today
      const { data: activeUsers } = await supabase
        .from('user_analytics')
        .select('telegram_id')
        .gte('last_active', today.toISOString());

      // Calculate stats from available data
      const messagesToday = (botUsage?.length || 0) + (notifications?.length || 0);
      const activeUsersToday = new Set([
        ...(botUsage?.map(b => b.telegram_id) || []),
        ...(notifications?.map(n => n.telegram_id) || []),
        ...(activeUsers?.map(u => u.telegram_id) || [])
      ].filter(Boolean)).size;
      const commandsToday = botUsage?.filter(b => b.message_type === 'command').length || 0;

      setBotStats({
        messagesToday,
        activeUsersToday,
        commandsToday
      });
    } catch (error) {
      console.error('Error fetching bot stats:', error);
      // Keep zero stats on error
    } finally {
      setIsLoading(false);
    }
  };

  return {
    botStats,
    isLoading,
    refetch: fetchBotStats
  };
}
