import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface ShareToGroupsOptions {
  auctionId: string;
  stockNumber: string;
  diamondDescription: string;
  currentPrice: number;
  minIncrement: number;
  currency: string;
  endsAt: string;
  imageUrl?: string;
  groupIds?: number[]; // Optional: specify groups, otherwise uses defaults
}

interface BidWarModeResult {
  extended: boolean;
  newEndTime?: Date;
  reason?: string;
}

export function useAuctionViralMechanics() {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const authContext = useTelegramAuth();
  
  // Defensive check: Return safe fallback if auth context is unavailable
  if (!authContext || !authContext.user) {
    console.warn('⚠️ useAuctionViralMechanics: Auth context not available');
    return {
      shareToGroups: async () => false,
      checkBidWarMode: async () => ({ extended: false }),
      announceWinner: async () => false,
      sendLoserConsolation: async () => false,
      isSharing: false,
    };
  }

  const { user } = authContext;

  /**
   * Auto-share auction to multiple Telegram groups
   * This makes auctions go viral by hitting 3+ groups simultaneously
   */
  const shareToGroups = async (options: ShareToGroupsOptions): Promise<boolean> => {
    setIsSharing(true);
    console.log('📤 Sharing auction to groups:', options.auctionId);

    try {
      // Default test groups - replace with your actual group IDs
      const targetGroups = options.groupIds || [];

      // If no groups specified, just mark as success (auction created but not shared)
      if (targetGroups.length === 0) {
        console.log('⚠️ No target groups specified, skipping auto-share');
        setIsSharing(false);
        return true; // Still return success since auction was created
      }

      const sharePromises = targetGroups.map(async (groupId) => {
        try {
          console.log(`📤 Sending auction to group ${groupId}...`);
          
          const { data, error } = await supabase.functions.invoke('send-auction-message', {
            body: {
              chat_id: groupId,
              auction_id: options.auctionId,
              stock_number: options.stockNumber,
              diamond_description: options.diamondDescription,
              current_price: options.currentPrice,
              min_increment: options.minIncrement,
              currency: options.currency,
              ends_at: options.endsAt,
              image_url: options.imageUrl,
            },
          });

          if (error) {
            const errorDetails = {
              message: error.message,
              context: error.context,
              name: error.name,
              status: error.status,
              details: error.details,
              hint: error.hint,
              code: error.code,
              fullError: JSON.stringify(error, null, 2)
            };
            console.error(`❌ Failed to share to group ${groupId}:`, errorDetails);
            
            // Store detailed error for alert
            (window as any).lastAuctionShareError = {
              groupId,
              auctionId: options.auctionId,
              error: errorDetails,
              timestamp: new Date().toISOString()
            };
            
            return false;
          }
          
          if (!data?.success) {
            const dataError = {
              data: JSON.stringify(data, null, 2),
              hasSuccess: 'success' in data,
              successValue: data?.success,
              error: data?.error,
              message: data?.message
            };
            console.error(`❌ Sharing unsuccessful for group ${groupId}:`, dataError);
            
            // Store detailed data error for alert
            (window as any).lastAuctionShareError = {
              groupId,
              auctionId: options.auctionId,
              responseData: dataError,
              timestamp: new Date().toISOString()
            };
            
            return false;
          }

          console.log(`✅ Successfully shared to group ${groupId}, message ID:`, data.message_id);
          return true;
        } catch (error) {
          console.error(`❌ Exception sharing to group ${groupId}:`, error);
          console.error(`❌ Stack:`, error?.stack);
          return false;
        }
      });

      const results = await Promise.all(sharePromises);
      const successCount = results.filter(r => r).length;
      
      console.log(`📊 Sharing results: ${successCount}/${targetGroups.length} succeeded`);

      if (successCount > 0) {
        hapticFeedback.notification('success');
        toast({
          title: `🎉 המכרז שותף ל-${successCount} קבוצות!`,
          description: 'הכרטיס עם כפתורי הצעה נשלח בהצלחה',
          duration: 3000,
        });
        
        // Track viral sharing event
        await supabase.from('auction_analytics').insert({
          auction_id: options.auctionId,
          telegram_id: user?.id || 0,
          event_type: 'viral_share',
          event_data: {
            groups_count: successCount,
            total_attempted: targetGroups.length,
            timestamp: new Date().toISOString(),
          },
        });

        return true;
      } else {
        const lastError = (window as any).lastAuctionShareError;
        console.error('❌ Failed to share to ANY groups');
        console.error('❌ Last error details:', lastError);
        
        const errorMsg = lastError?.error?.message || lastError?.responseData?.error || 
                        `Failed to share to any of ${targetGroups.length} groups`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Viral sharing FAILED:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        auctionId: options.auctionId,
      });
      
      hapticFeedback.notification('error');
      toast({
        title: 'שגיאה בשיתוף לטלגרם',
        description: error?.message || 'לא ניתן לשתף לקבוצות כרגע',
        variant: 'destructive',
        duration: 5000,
      });
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Check and trigger "Bid War Mode"
   * If 3+ bids within 5 minutes, extend auction by 10 minutes
   */
  const checkBidWarMode = async (auctionId: string): Promise<BidWarModeResult> => {
    try {
      // Get bids from last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const { data: recentBids, error } = await supabase
        .from('auction_bids')
        .select('id, created_at')
        .eq('auction_id', auctionId)
        .gte('created_at', fiveMinutesAgo.toISOString());

      if (error) throw error;

      if (recentBids && recentBids.length >= 3) {
        // BID WAR MODE ACTIVATED! 🔥
        console.log('🔥 BID WAR MODE ACTIVATED:', auctionId);

        // Get current auction
        const { data: auction, error: auctionError } = await supabase
          .from('auctions')
          .select('ends_at')
          .eq('id', auctionId)
          .single();

        if (auctionError) throw auctionError;

        // Extend by 10 minutes
        const currentEndTime = new Date(auction.ends_at);
        const newEndTime = new Date(currentEndTime.getTime() + 10 * 60 * 1000);

        const { error: updateError } = await supabase
          .from('auctions')
          .update({ ends_at: newEndTime.toISOString() })
          .eq('id', auctionId);

        if (updateError) throw updateError;

        // Track bid war mode activation
        await supabase.from('auction_analytics').insert({
          auction_id: auctionId,
          telegram_id: user?.id || 0,
          event_type: 'bid_war_activated',
          event_data: {
            recent_bids_count: recentBids.length,
            extension_minutes: 10,
            new_end_time: newEndTime.toISOString(),
            timestamp: new Date().toISOString(),
          },
        });

        hapticFeedback.notification('success');
        toast({
          title: '🔥 מצב מלחמת הצעות!',
          description: 'המכרז הוארך ב-10 דקות בגלל פעילות אינטנסיבית',
        });

        return {
          extended: true,
          newEndTime,
          reason: 'bid_war_mode',
        };
      }

      return { extended: false };
    } catch (error) {
      console.error('Error checking bid war mode:', error);
      return { extended: false };
    }
  };

  /**
   * Send winner announcement to Telegram Story
   */
  const announceWinner = async (
    auctionId: string,
    winnerName: string,
    finalPrice: number,
    stockNumber: string,
    imageUrl?: string
  ): Promise<boolean> => {
    try {
      console.log('🏆 Announcing winner to story:', { auctionId, winnerName, finalPrice });

      // This would integrate with Telegram Stories API
      // For now, just track the event
      await supabase.from('auction_analytics').insert({
        auction_id: auctionId,
        telegram_id: user?.id || 0,
        event_type: 'winner_announced',
        event_data: {
          winner_name: winnerName,
          final_price: finalPrice,
          stock_number: stockNumber,
          timestamp: new Date().toISOString(),
        },
      });

      toast({
        title: '🏆 הזוכה הוכרז!',
        description: `${winnerName} זכה במכרז ב-$${finalPrice}`,
      });

      return true;
    } catch (error) {
      console.error('Error announcing winner:', error);
      return false;
    }
  };

  /**
   * Send "Better Luck Next Time" message with similar diamonds
   */
  const sendLoserConsolation = async (
    loserId: number,
    auctionId: string,
    similarDiamonds: any[]
  ): Promise<boolean> => {
    try {
      console.log('💔 Sending consolation to loser:', loserId);

      // This would send a personalized message with 3 similar diamonds
      await supabase.from('auction_analytics').insert({
        auction_id: auctionId,
        telegram_id: loserId,
        event_type: 'consolation_sent',
        event_data: {
          similar_diamonds_count: similarDiamonds.length,
          timestamp: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error sending consolation:', error);
      return false;
    }
  };

  return {
    shareToGroups,
    checkBidWarMode,
    announceWinner,
    sendLoserConsolation,
    isSharing,
  };
}
