import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface PresenceUser {
  telegram_id: number;
  user_name: string | null;
  last_heartbeat: string;
}

export function useAuctionPresence(auctionId: string) {
  const [spectators, setSpectators] = useState<PresenceUser[]>([]);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const { user } = useTelegramAuth();

  useEffect(() => {
    if (!auctionId || !user) return;

    // Join presence
    const joinPresence = async () => {
      try {
        await supabase
          .from('auction_presence')
          .upsert({
            auction_id: auctionId,
            telegram_id: user.id,
            user_name: user.first_name || 'User',
            last_heartbeat: new Date().toISOString(),
          }, {
            onConflict: 'auction_id,telegram_id'
          });
      } catch (error) {
        console.error('Failed to join presence:', error);
      }
    };

    joinPresence();

    // Heartbeat every 5 seconds
    const heartbeatInterval = setInterval(async () => {
      try {
        await supabase
          .from('auction_presence')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('auction_id', auctionId)
          .eq('telegram_id', user.id);
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 5000);

    // Subscribe to presence changes
    const channel = supabase
      .channel(`auction-presence-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_presence',
          filter: `auction_id=eq.${auctionId}`,
        },
        async () => {
          // Fetch updated presence list
          const { data } = await supabase
            .from('auction_presence')
            .select('*')
            .eq('auction_id', auctionId)
            .gt('last_heartbeat', new Date(Date.now() - 15000).toISOString()); // Active in last 15s

          if (data) {
            setSpectators(data);
            setSpectatorCount(data.length);
          }
        }
      )
      .subscribe();

    // Initial fetch
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('auction_presence')
        .select('*')
        .eq('auction_id', auctionId)
        .gt('last_heartbeat', new Date(Date.now() - 15000).toISOString());

      if (data) {
        setSpectators(data);
        setSpectatorCount(data.length);
      }
    };

    fetchPresence();

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      supabase.removeChannel(channel);
      
      // Leave presence
      supabase
        .from('auction_presence')
        .delete()
        .eq('auction_id', auctionId)
        .eq('telegram_id', user.id)
        .then(() => console.log('Left presence'));
    };
  }, [auctionId, user]);

  return { spectators, spectatorCount };
}
