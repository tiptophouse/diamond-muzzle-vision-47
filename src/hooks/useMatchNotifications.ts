import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchNotification {
  id: string;
  buyer_id: number;
  seller_id: number;
  diamond_id: string;
  is_match: boolean;
  confidence_score: number;
  details_json: any;
  created_at: string;
  updated_at: string;
}

interface NotificationsResponse {
  notifications: MatchNotification[];
  total: number;
  has_more: boolean;
}

export function useMatchNotifications(userId: number) {
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔔 Fetching match notifications for user:', userId);

      const { data, error: functionError } = await supabase.functions.invoke('match-notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (functionError) {
        console.error('❌ Match notifications error:', functionError);
        throw new Error(functionError.message || 'Failed to fetch match notifications');
      }

      const response = data as NotificationsResponse;
      
      setNotifications(response.notifications || []);
      setTotal(response.total || 0);

      console.log('✅ Match notifications fetched:', {
        count: response.notifications?.length || 0,
        total: response.total || 0
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch match notifications';
      setError(errorMessage);
      toast.error(`Failed to load notifications: ${errorMessage}`);
      console.error('❌ useMatchNotifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchNotifications();
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  return {
    notifications,
    loading,
    error,
    total,
    refresh
  };
}