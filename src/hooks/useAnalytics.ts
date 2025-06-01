
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalytics {
  id: string;
  telegram_id: number;
  user_id?: string;
  total_visits: number;
  total_time_spent: string | null;
  last_active?: string;
  lifetime_value: number;
  api_calls_count: number;
  storage_used_mb: number;
  cost_per_user: number;
  revenue_per_user: number;
  profit_loss: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure proper types
      const mappedData = (data || []).map(item => ({
        ...item,
        total_time_spent: item.total_time_spent ? String(item.total_time_spent) : null,
        total_visits: item.total_visits || 0,
        lifetime_value: item.lifetime_value || 0,
        api_calls_count: item.api_calls_count || 0,
        storage_used_mb: item.storage_used_mb || 0,
        cost_per_user: item.cost_per_user || 0,
        revenue_per_user: item.revenue_per_user || 0,
        profit_loss: item.profit_loss || 0,
        subscription_status: item.subscription_status || 'free'
      }));
      
      setAnalytics(mappedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserAnalytics = async (telegramId: number, updates: Partial<UserAnalytics>) => {
    try {
      const { error } = await supabase
        .from('user_analytics')
        .upsert({
          telegram_id: telegramId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'telegram_id'
        });

      if (error) throw error;
      
      // Refresh data
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating user analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    updateUserAnalytics,
    refetch: fetchAnalytics
  };
}
