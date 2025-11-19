import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendAuctionNotificationParams {
  auctionId: string;
  recipientTelegramId: number;
  notificationType: 'new_bid' | 'outbid' | 'winner' | 'auction_ended' | 'auction_starting';
  currentPrice?: number;
  bidderName?: string;
  customMessage?: string;
}

/**
 * Hook for sending auction notifications using the diamond card template
 * Tracks performance and user engagement automatically
 */
export function useAuctionNotifications() {
  const { toast } = useToast();

  const sendNotification = async (params: SendAuctionNotificationParams) => {
    try {
      console.log('📤 Sending auction notification:', params);

      const { data, error } = await supabase.functions.invoke('send-auction-notification', {
        body: params,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Notification sent:', {
        trackingId: data.tracking_id,
        messageId: data.message_id,
        responseTime: data.response_time_ms,
      });

      return {
        success: true,
        trackingId: data.tracking_id,
        messageId: data.message_id,
        responseTime: data.response_time_ms,
      };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      
      toast({
        title: 'Notification Failed',
        description: 'Could not send auction notification',
        variant: 'destructive',
      });

      return {
        success: false,
        error: error.message,
      };
    }
  };

  /**
   * Send "new bid" notification to seller
   */
  const notifySellerNewBid = async (
    auctionId: string,
    sellerTelegramId: number,
    currentPrice: number,
    bidderName: string
  ) => {
    return sendNotification({
      auctionId,
      recipientTelegramId: sellerTelegramId,
      notificationType: 'new_bid',
      currentPrice,
      bidderName,
    });
  };

  /**
   * Send "outbid" notification to previous highest bidder
   */
  const notifyBidderOutbid = async (
    auctionId: string,
    bidderTelegramId: number,
    previousBid: number,
    newBid: number
  ) => {
    return sendNotification({
      auctionId,
      recipientTelegramId: bidderTelegramId,
      notificationType: 'outbid',
      currentPrice: newBid,
      customMessage: previousBid.toString(), // Previous bid amount
    });
  };

  /**
   * Send "winner" notification
   */
  const notifyWinner = async (
    auctionId: string,
    winnerTelegramId: number,
    winningBid: number
  ) => {
    return sendNotification({
      auctionId,
      recipientTelegramId: winnerTelegramId,
      notificationType: 'winner',
      currentPrice: winningBid,
    });
  };

  /**
   * Send "auction ended" notification to seller
   */
  const notifyAuctionEnded = async (
    auctionId: string,
    sellerTelegramId: number,
    customMessage?: string
  ) => {
    return sendNotification({
      auctionId,
      recipientTelegramId: sellerTelegramId,
      notificationType: 'auction_ended',
      customMessage,
    });
  };

  /**
   * Send "auction starting" notification (e.g., to followers)
   */
  const notifyAuctionStarting = async (
    auctionId: string,
    followerTelegramId: number
  ) => {
    return sendNotification({
      auctionId,
      recipientTelegramId: followerTelegramId,
      notificationType: 'auction_starting',
    });
  };

  /**
   * Get notification analytics for an auction
   */
  const getNotificationAnalytics = async (auctionId: string) => {
    try {
      const { data, error } = await supabase
        .from('auction_analytics')
        .select('*')
        .eq('auction_id', auctionId)
        .in('event_type', [
          'notification_new_bid_sent',
          'notification_outbid_sent',
          'notification_winner_sent',
          'notification_ended_sent',
          'notification_starting_sent',
          'notification_opened',
          'notification_failed',
        ])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate metrics
      const sent = data.filter(e => e.event_type.includes('_sent')).length;
      const opened = data.filter(e => e.event_type === 'notification_opened').length;
      const failed = data.filter(e => e.event_type === 'notification_failed').length;
      const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(2) : '0';

      // Average response time
      const sentEvents = data.filter(e => {
        const eventData = e.event_data as any;
        return eventData?.response_time_ms;
      });
      const avgResponseTime = sentEvents.length > 0
        ? (sentEvents.reduce((sum, e) => {
            const eventData = e.event_data as any;
            return sum + (eventData?.response_time_ms || 0);
          }, 0) / sentEvents.length).toFixed(0)
        : '0';

      return {
        totalSent: sent,
        totalOpened: opened,
        totalFailed: failed,
        openRate: parseFloat(openRate),
        avgResponseTimeMs: parseInt(avgResponseTime),
        events: data,
      };
    } catch (error) {
      console.error('❌ Failed to get notification analytics:', error);
      return null;
    }
  };

  return {
    sendNotification,
    notifySellerNewBid,
    notifyBidderOutbid,
    notifyWinner,
    notifyAuctionEnded,
    notifyAuctionStarting,
    getNotificationAnalytics,
  };
}
