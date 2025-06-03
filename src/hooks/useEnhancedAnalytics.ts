
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedUserData {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  language_code?: string;
  is_premium: boolean;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
  total_visits: number;
  total_time_spent?: string;
  last_active?: string;
  lifetime_value: number;
  api_calls_count: number;
  storage_used_mb: number;
  cost_per_user: number;
  revenue_per_user: number;
  profit_loss: number;
  subscription_status: string;
}

interface NotificationData {
  id: string;
  telegram_id: number;
  message_type: string;
  message_content: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  metadata?: any;
  created_at: string;
  user_first_name?: string;
  user_last_name?: string;
}

interface UserAnalytics {
  total_visits?: number;
  total_time_spent?: unknown;
  last_active?: string;
  lifetime_value?: number;
  api_calls_count?: number;
  storage_used_mb?: number;
  cost_per_user?: number;
  revenue_per_user?: number;
  profit_loss?: number;
  subscription_status?: string;
}

export function useEnhancedAnalytics() {
  const [enhancedUsers, setEnhancedUsers] = useState<EnhancedUserData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnhancedUserData = async () => {
    try {
      console.log('🔄 Fetching enhanced user data...');
      
      // Fetch user profiles with analytics data
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_analytics (
            total_visits,
            total_time_spent,
            last_active,
            lifetime_value,
            api_calls_count,
            storage_used_mb,
            cost_per_user,
            revenue_per_user,
            profit_loss,
            subscription_status
          )
        `)
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      console.log('📊 Fetched user data:', userData?.length, 'users');

      // Transform the data to flatten analytics
      const transformedData = (userData || []).map(user => {
        // Safely access the first analytics record with proper typing
        const analytics: UserAnalytics = Array.isArray(user.user_analytics) && user.user_analytics.length > 0 
          ? user.user_analytics[0] 
          : {};
        
        return {
          id: user.id,
          telegram_id: user.telegram_id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          phone_number: user.phone_number,
          language_code: user.language_code,
          is_premium: user.is_premium || false,
          photo_url: user.photo_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
          total_visits: analytics.total_visits || 0,
          total_time_spent: analytics.total_time_spent ? String(analytics.total_time_spent) : undefined,
          last_active: analytics.last_active,
          lifetime_value: analytics.lifetime_value || 0,
          api_calls_count: analytics.api_calls_count || 0,
          storage_used_mb: analytics.storage_used_mb || 0,
          cost_per_user: analytics.cost_per_user || 0,
          revenue_per_user: analytics.revenue_per_user || 0,
          profit_loss: analytics.profit_loss || 0,
          subscription_status: analytics.subscription_status || 'free'
        };
      });

      setEnhancedUsers(transformedData);
      console.log('✅ Enhanced users data set:', transformedData.length, 'users');
    } catch (error) {
      console.error('❌ Error fetching enhanced user data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications...');
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user_profiles!notifications_telegram_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      console.log('📬 Fetched notifications:', data?.length, 'notifications');

      const transformedNotifications = (data || []).map(notification => ({
        ...notification,
        user_first_name: notification.user_profiles?.first_name,
        user_last_name: notification.user_profiles?.last_name
      }));

      setNotifications(transformedNotifications);
      console.log('✅ Notifications data set:', transformedNotifications.length, 'notifications');
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      // Set empty array on error to prevent UI issues
      setNotifications([]);
    }
  };

  const getUserEngagementScore = (user: EnhancedUserData): number => {
    // Calculate engagement score based on visits, time spent, and activity
    const visitScore = Math.min(user.total_visits * 2, 50);
    const activityScore = user.last_active ? 
      (Date.now() - new Date(user.last_active).getTime() < 24 * 60 * 60 * 1000 ? 30 : 10) : 0;
    const premiumScore = user.is_premium ? 20 : 0;
    
    return Math.min(visitScore + activityScore + premiumScore, 100);
  };

  const getTopUsers = () => {
    return [...enhancedUsers]
      .sort((a, b) => getUserEngagementScore(b) - getUserEngagementScore(a))
      .slice(0, 10);
  };

  const getUserStats = () => {
    const totalUsers = enhancedUsers.length;
    const activeToday = enhancedUsers.filter(u => 
      u.last_active && new Date(u.last_active) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    const premiumUsers = enhancedUsers.filter(u => u.is_premium).length;
    const usersWithPhone = enhancedUsers.filter(u => u.phone_number).length;

    return {
      totalUsers,
      activeToday,
      premiumUsers,
      usersWithPhone,
      averageVisits: totalUsers > 0 ? enhancedUsers.reduce((sum, u) => sum + u.total_visits, 0) / totalUsers : 0
    };
  };

  const refetch = async () => {
    console.log('🔄 Refetching all data...');
    setIsLoading(true);
    await Promise.all([fetchEnhancedUserData(), fetchNotifications()]);
    setIsLoading(false);
    console.log('✅ Refetch completed');
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Initial data load started...');
      setIsLoading(true);
      await Promise.all([fetchEnhancedUserData(), fetchNotifications()]);
      setIsLoading(false);
      console.log('✅ Initial data load completed');
    };

    loadData();
  }, []);

  return {
    enhancedUsers,
    notifications,
    isLoading,
    getUserEngagementScore,
    getTopUsers,
    getUserStats,
    refetch
  };
}
