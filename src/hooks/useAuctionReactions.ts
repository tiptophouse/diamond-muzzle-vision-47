import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

type ReactionType = 'fire' | 'shocked' | 'diamond' | 'clap' | 'eyes';

interface Reaction {
  id: string;
  telegram_id: number;
  reaction_type: ReactionType;
  created_at: string;
  expires_at: string;
}

export function useAuctionReactions(auctionId: string) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    fire: 0,
    shocked: 0,
    diamond: 0,
    clap: 0,
    eyes: 0,
  });
  const { user } = useTelegramAuth();
  const { hapticFeedback } = useTelegramWebApp();

  useEffect(() => {
    if (!auctionId) return;

    // Fetch current reactions (not expired)
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('auction_reactions')
        .select('*')
        .eq('auction_id', auctionId)
        .gt('expires_at', new Date().toISOString());

      if (!error && data) {
        setReactions(data as Reaction[]);
        
        // Count by type
        const counts: Record<ReactionType, number> = {
          fire: 0,
          shocked: 0,
          diamond: 0,
          clap: 0,
          eyes: 0,
        };
        
        data.forEach(r => {
          counts[r.reaction_type as ReactionType]++;
        });
        
        setReactionCounts(counts);
      }
    };

    fetchReactions();

    // Subscribe to new reactions
    const channel = supabase
      .channel(`auction-reactions-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_reactions',
          filter: `auction_id=eq.${auctionId}`,
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    // Clean up expired reactions every 5 seconds
    const cleanupInterval = setInterval(() => {
      setReactions(prev => prev.filter(r => new Date(r.expires_at) > new Date()));
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
    };
  }, [auctionId]);

  const addReaction = async (reactionType: ReactionType) => {
    if (!user) return;

    try {
      hapticFeedback.impact('light');

      const { error } = await supabase
        .from('auction_reactions')
        .insert({
          auction_id: auctionId,
          telegram_id: user.id,
          reaction_type: reactionType,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  return { reactions, reactionCounts, addReaction };
}
