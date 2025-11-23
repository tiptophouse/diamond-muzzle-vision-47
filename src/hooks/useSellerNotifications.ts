import { useState, useEffect } from 'react';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import type { SellerNotificationSchema } from '@/types/fastapi-models';
import { toast } from 'sonner';

interface UseSellerNotificationsOptions {
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
}

export function useSellerNotifications(options: UseSellerNotificationsOptions = {}) {
  const { limit = 50, offset = 0, autoFetch = true } = options;
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<SellerNotificationSchema[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  /**
   * Fetch seller notifications (buyers who searched and matched your inventory)
   */
  const fetchNotifications = async (fetchOffset = offset) => {
    const userId = getCurrentUserId();
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await api.get<SellerNotificationSchema[]>(
        apiEndpoints.getSellerNotifications({ limit, offset: fetchOffset })
      );
      
      if (error) {
        console.error('Seller notifications error:', error);
        toast.error('Failed to load notifications');
        return;
      }

      if (data) {
        setNotifications(data);
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error('Seller notifications exception:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch notification count
   */
  const fetchNotificationCount = async () => {
    try {
      const { data, error } = await api.get<{ total: number }>(
        apiEndpoints.getSellerNotificationsCount()
      );
      
      if (error) {
        console.error('Notification count error:', error);
        return;
      }

      if (data?.total !== undefined) {
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Notification count exception:', error);
    }
  };

  /**
   * Load next page
   */
  const loadMore = async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(offset + notifications.length);
  };

  /**
   * Refresh notifications
   */
  const refresh = async () => {
    await Promise.all([
      fetchNotifications(0),
      fetchNotificationCount()
    ]);
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]);

  return {
    loading,
    notifications,
    totalCount,
    hasMore,
    fetchNotifications,
    fetchNotificationCount,
    loadMore,
    refresh,
  };
}
