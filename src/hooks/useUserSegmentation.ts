import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserSegments {
  inactiveWithoutStock: number;
  inactiveWithStock: number;
  activeWithoutStock: number;
  activeWithStock: number;
  payingUsers: number;
  nonPayingUsers: number;
  totalUsers: number;
}

export function useUserSegmentation() {
  const [segments, setSegments] = useState<UserSegments>({
    inactiveWithoutStock: 0,
    inactiveWithStock: 0,
    activeWithoutStock: 0,
    activeWithStock: 0,
    payingUsers: 0,
    nonPayingUsers: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSegments();
  }, []);

  const fetchUserSegments = async () => {
    try {
      setLoading(true);

      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('telegram_id, last_active');

      if (usersError) throw usersError;

      // Get inventory counts per user
      const { data: inventoryCounts, error: inventoryError } = await supabase
        .from('inventory')
        .select('user_id')
        .is('deleted_at', null);

      if (inventoryError) throw inventoryError;

      // Count inventory per user
      const userInventoryMap = new Map<number, number>();
      inventoryCounts?.forEach(item => {
        const count = userInventoryMap.get(item.user_id) || 0;
        userInventoryMap.set(item.user_id, count + 1);
      });

      // Check subscription status for all users
      const subscriptionChecks = await Promise.allSettled(
        (users || []).map(async (user) => {
          const { data } = await supabase.functions.invoke('check-subscription-status', {
            body: { user_id: user.telegram_id }
          });
          return {
            telegram_id: user.telegram_id,
            is_active: data?.is_active || false,
            last_active: user.last_active,
            has_inventory: (userInventoryMap.get(user.telegram_id) || 0) > 0
          };
        })
      );

      // Process results
      const results = subscriptionChecks
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let inactiveWithoutStock = 0;
      let inactiveWithStock = 0;
      let activeWithoutStock = 0;
      let activeWithStock = 0;
      let payingUsers = 0;
      let nonPayingUsers = 0;

      results.forEach(user => {
        const isActive = user.last_active && new Date(user.last_active) > sevenDaysAgo;
        const hasStock = user.has_inventory;

        if (user.is_active) {
          payingUsers++;
        } else {
          nonPayingUsers++;
        }

        if (isActive && hasStock) activeWithStock++;
        else if (isActive && !hasStock) activeWithoutStock++;
        else if (!isActive && hasStock) inactiveWithStock++;
        else inactiveWithoutStock++;
      });

      setSegments({
        inactiveWithoutStock,
        inactiveWithStock,
        activeWithoutStock,
        activeWithStock,
        payingUsers,
        nonPayingUsers,
        totalUsers: users?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching user segments:', error);
      toast({
        title: "Error loading segments",
        description: "Failed to analyze user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { segments, loading, refetch: fetchUserSegments };
}
