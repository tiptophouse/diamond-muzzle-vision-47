
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleUserData {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  is_premium: boolean;
  created_at: string;
  subscription_status: string;
}

export function useSimplifiedAnalytics() {
  const [users, setUsers] = useState<SimpleUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching simplified user data...');
      
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          telegram_id,
          first_name,
          last_name,
          username,
          phone_number,
          is_premium,
          created_at,
          subscription_plan
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent overload

      if (userError) {
        console.error('Error fetching users:', userError);
        throw userError;
      }

      const transformedData = (userData || []).map(user => ({
        id: user.id,
        telegram_id: user.telegram_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        phone_number: user.phone_number,
        is_premium: user.is_premium || false,
        created_at: user.created_at,
        subscription_status: user.subscription_plan || 'free'
      }));

      setUsers(transformedData);
      console.log('✅ Users data loaded:', transformedData.length, 'users');
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserStats = useCallback(() => {
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.is_premium).length;
    const usersWithPhone = users.filter(u => u.phone_number).length;
    const activeToday = users.filter(u => 
      new Date(u.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalUsers,
      activeToday,
      premiumUsers,
      usersWithPhone,
      averageVisits: 0 // Simplified - no complex calculations
    };
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    getUserStats,
    refetch: fetchUsers
  };
}
