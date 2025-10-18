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

      const { data: botUsage, error } = await supabase
        .from('bot_usage_analytics')
        .select('telegram_id, message_type, command')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const messagesToday = botUsage?.length || 0;
      const activeUsersToday = new Set(botUsage?.map(b => b.telegram_id) || []).size;
      const commandsToday = botUsage?.filter(b => b.message_type === 'command').length || 0;

      setBotStats({
        messagesToday,
        activeUsersToday,
        commandsToday
      });
    } catch (error) {
      console.error('Error fetching bot stats:', error);
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
