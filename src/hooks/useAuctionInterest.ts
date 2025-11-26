import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

export function useAuctionInterest(auctionId: string) {
  const [interestCount, setInterestCount] = useState(0);
  const [hasInterest, setHasInterest] = useState(false);
  const [isTogglingInterest, setIsTogglingInterest] = useState(false);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!auctionId) return;

    // Fetch initial interest count
    const fetchInterest = async () => {
      const { data, error } = await supabase
        .from('auction_interest')
        .select('*')
        .eq('auction_id', auctionId);

      if (!error && data) {
        setInterestCount(data.length);
        if (user) {
          setHasInterest(data.some(i => i.telegram_id === user.id));
        }
      }
    };

    fetchInterest();

    // Subscribe to interest changes
    const channel = supabase
      .channel(`auction-interest-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_interest',
          filter: `auction_id=eq.${auctionId}`,
        },
        () => {
          fetchInterest();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId, user]);

  const toggleInterest = async () => {
    if (!user) {
      toast({ title: 'יש להתחבר כדי לסמן עניין', variant: 'destructive' });
      return;
    }

    setIsTogglingInterest(true);

    try {
      if (hasInterest) {
        // Remove interest
        const { error } = await supabase
          .from('auction_interest')
          .delete()
          .eq('auction_id', auctionId)
          .eq('telegram_id', user.id);

        if (error) throw error;

        setHasInterest(false);
        toast({ title: '✅ הסרת סימון עניין' });
      } else {
        // Add interest
        const { error } = await supabase
          .from('auction_interest')
          .insert({
            auction_id: auctionId,
            telegram_id: user.id,
            user_name: user.first_name || 'User',
          });

        if (error) throw error;

        setHasInterest(true);
        toast({ title: '🔥 סימנת עניין במכרז!' });
      }
    } catch (error) {
      console.error('Failed to toggle interest:', error);
      toast({ title: 'שגיאה', description: 'לא ניתן לעדכן עניין', variant: 'destructive' });
    } finally {
      setIsTogglingInterest(false);
    }
  };

  return { interestCount, hasInterest, toggleInterest, isTogglingInterest };
}
