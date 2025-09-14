import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface BotUsageData {
  id: string;
  telegram_id: number;
  bot_token_type: string;
  command: string | null;
  message_type: string;
  chat_type: string;
  user_info: Json;
  response_time_ms: number;
  created_at: string;
}

interface BotSummary {
  total_messages_today: number;
  unique_users_today: number;
  commands_used_today: number;
  avg_response_time_ms: number;
  most_used_commands: Json;
  active_chats: number;
  bot_distribution: Json;
}

export function useBotAnalytics() {
  const [recentActivity, setRecentActivity] = useState<BotUsageData[]>([]);
  const [summary, setSummary] = useState<BotSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadBotAnalytics();
    loadBotSummary();

    // Set up real-time subscription
    const channel = supabase
      .channel('bot-usage-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bot_usage_analytics'
        },
        (payload) => {
          console.log('📊 Real-time bot usage update:', payload);
          const newUsage = payload.new as BotUsageData;
          
          setRecentActivity(prev => [newUsage, ...prev.slice(0, 19)]);
          loadBotSummary(); // Refresh summary stats
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_messages'
        },
        () => {
          // Also track chatbot messages for complete analytics
          loadBotSummary();
        }
      )
      .subscribe((status) => {
        console.log('📡 Bot analytics subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, []);

  const loadBotAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_usage_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('❌ Error loading bot analytics:', error);
    }
  };

  const loadBotSummary = async () => {
    try {
      const { data, error } = await supabase.rpc('get_bot_usage_summary');
      
      if (error) throw error;
      if (data && data.length > 0) {
        setSummary(data[0]);
      }
    } catch (error) {
      console.error('❌ Error loading bot summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([loadBotAnalytics(), loadBotSummary()]);
  };

  return {
    recentActivity,
    summary,
    isLoading,
    isConnected,
    refreshData
  };
}