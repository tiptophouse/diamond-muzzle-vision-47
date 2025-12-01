import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';
import { useIsAdmin } from './useIsAdmin';

interface ShareQuotaData {
  sharesRemaining: number;
  sharesUsed: number;
  sharesGranted: number;
  quotaResetAt: string | null;
}

export function useShareQuota() {
  const [quotaData, setQuotaData] = useState<ShareQuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useTelegramWebApp();
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();

  const fetchQuotaData = async () => {
    console.log('🔄 useShareQuota: Fetching quota data', { userId: user?.id, isAdmin });
    
    if (!user?.id) {
      console.warn('⚠️ useShareQuota: No user ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('📊 useShareQuota: Fetching from Supabase...');
      // First get shares_remaining from user_profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('shares_remaining, telegram_id')
        .eq('telegram_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ useShareQuota: Error fetching user profile:', profileError);
        setLoading(false);
        return;
      }

      console.log('✅ useShareQuota: User profile fetched', userProfile);

      // Get quota details from user_share_quotas if exists
      const { data: quotaDetails } = await supabase
        .from('user_share_quotas')
        .select('shares_used, shares_granted, quota_reset_at')
        .eq('user_telegram_id', user.id)
        .single();

      const finalQuota = {
        sharesRemaining: isAdmin ? 999 : (userProfile?.shares_remaining || 5),
        sharesUsed: quotaDetails?.shares_used || 0,
        sharesGranted: isAdmin ? 999 : (quotaDetails?.shares_granted || 5),
        quotaResetAt: quotaDetails?.quota_reset_at || null
      };

      console.log('✅ useShareQuota: Final quota data', finalQuota);
      setQuotaData(finalQuota);
    } catch (error) {
      console.error('❌ useShareQuota: Error fetching quota data:', error);
    } finally {
      setLoading(false);
    }
  };

  const useShare = async (diamondStockNumber: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to share diamonds",
        variant: "destructive"
      });
      return false;
    }

    // Admin users bypass quota entirely
    if (isAdmin) {
      return true;
    }

    try {
      // Call the database function to use a share
      const { data, error } = await supabase.rpc('use_share_quota', {
        p_user_telegram_id: user.id,
        p_diamond_stock_number: diamondStockNumber
      });

      if (error) {
        console.error('Error using share quota:', error);
        toast({
          title: "Share Failed",
          description: "Failed to process share. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data === false) {
        toast({
          title: "No Shares Remaining",
          description: "You have used all your available shares for this period",
          variant: "destructive"
        });
        return false;
      }

      // Refresh quota data
      await fetchQuotaData();
      
      return true;
    } catch (error) {
      console.error('Error using share:', error);
      toast({
        title: "Share Failed",
        description: "An error occurred while processing your share",
        variant: "destructive"
      });
      return false;
    }
  };

  const getShareHistory = async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('user_share_history')
        .select('*')
        .eq('user_telegram_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching share history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching share history:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchQuotaData();
  }, [user?.id]);

  return {
    quotaData,
    loading,
    useShare,
    getShareHistory,
    refetchQuota: fetchQuotaData
  };
}