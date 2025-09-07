import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

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

interface SearchResult {
  id: number;
  user_id: number;
  search_query: string;
  result_type: string;
  diamonds_data: any[] | null;
  message_sent: string | null;
  created_at: string;
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

      // Call FastAPI endpoint directly 
      const response = await api.get<SearchResult[]>(`/api/v1/get_search_results?user_id=${userId}&limit=50&offset=0&result_type=match`);

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch search results');
      }

      // Transform search results to match notification format
      const transformedNotifications: MatchNotification[] = response.data.map((result) => ({
        id: result.id.toString(),
        buyer_id: result.user_id,
        seller_id: result.user_id, // For now, same as buyer_id
        diamond_id: `diamond_${result.id}`,
        is_match: result.result_type === 'match',
        confidence_score: result.result_type === 'match' ? 0.85 : 0.25,
        details_json: {
          search_query: result.search_query,
          diamonds_data: result.diamonds_data,
          message_sent: result.message_sent
        },
        created_at: result.created_at,
        updated_at: result.created_at
      }));

      setNotifications(transformedNotifications);
      setTotal(transformedNotifications.length);

      console.log('✅ Match notifications fetched:', {
        count: transformedNotifications.length,
        total: transformedNotifications.length
      });

      if (transformedNotifications.length > 0) {
        toast.success(`Loaded ${transformedNotifications.length} notifications`);
      }

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