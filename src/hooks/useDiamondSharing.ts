
import { useState, useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareData {
  diamondId: string;
  stockNumber: string;
  sharedBy: number;
  shareUrl: string;
  shareTimestamp: number;
}

interface ViewAnalytics {
  sessionId: string;
  viewStartTime: number;
  totalViewTime: number;
  scrollDepth: number;
  interactions: string[];
  reshared: boolean;
  viewerInfo: {
    telegramId?: number;
    userAgent: string;
    deviceType: string;
  };
}

export function useDiamondSharing() {
  const { webApp, user } = useTelegramWebApp();
  const [isSharing, setIsSharing] = useState(false);
  const [analytics, setAnalytics] = useState<ViewAnalytics | null>(null);

  const shareWithInlineButton = useCallback(async (diamond: any) => {
    if (!webApp || !user) {
      toast.error('Telegram Mini App required for sharing');
      return false;
    }

    setIsSharing(true);

    try {
      // Create secure share URL with tracking parameters
      const shareData: ShareData = {
        diamondId: diamond.id,
        stockNumber: diamond.stockNumber,
        sharedBy: user.id,
        shareUrl: `${window.location.origin}/diamond/${diamond.id}?shared=true&from=${user.id}`,
        shareTimestamp: Date.now()
      };

      // Store share record in database
      await supabase.from('diamond_shares').insert({
        diamond_id: diamond.id,
        stock_number: diamond.stockNumber,
        shared_by: user.id,
        share_url: shareData.shareUrl,
        created_at: new Date().toISOString()
      });

      // Create Telegram message with inline button
      const message = {
        action: 'share_diamond',
        data: {
          text: `💎 Check out this ${diamond.carat}ct ${diamond.shape} diamond!\n\n` +
                `Color: ${diamond.color} | Clarity: ${diamond.clarity}\n` +
                `Price: $${diamond.price.toLocaleString()}\n` +
                `Stock: ${diamond.stockNumber}`,
          inline_keyboard: [
            [
              {
                text: '💎 View Diamond',
                web_app: {
                  url: shareData.shareUrl
                }
              }
            ],
            [
              {
                text: '📞 Contact Seller',
                callback_data: `contact_${diamond.stockNumber}_${user.id}`
              }
            ]
          ]
        }
      };

      // Send via Telegram WebApp
      webApp.sendData?.(JSON.stringify(message));
      
      toast.success('Diamond shared successfully!');
      return true;
    } catch (error) {
      console.error('Failed to share diamond:', error);
      toast.error('Failed to share diamond');
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [webApp, user]);

  const trackView = useCallback(async (diamondId: string, viewerData?: any) => {
    const sessionId = crypto.randomUUID();
    const viewStartTime = Date.now();

    const initialAnalytics: ViewAnalytics = {
      sessionId,
      viewStartTime,
      totalViewTime: 0,
      scrollDepth: 0,
      interactions: [],
      reshared: false,
      viewerInfo: {
        telegramId: viewerData?.telegramId,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      }
    };

    setAnalytics(initialAnalytics);

    // Store initial view record
    await supabase.from('diamond_views').insert({
      diamond_id: diamondId,
      session_id: sessionId,
      viewer_telegram_id: viewerData?.telegramId,
      view_start: new Date(viewStartTime).toISOString(),
      user_agent: navigator.userAgent,
      device_type: initialAnalytics.viewerInfo.deviceType,
      referrer: document.referrer
    });

    return sessionId;
  }, []);

  const updateViewTime = useCallback(async (sessionId: string, additionalTime: number) => {
    if (!analytics) return;

    const updatedAnalytics = {
      ...analytics,
      totalViewTime: analytics.totalViewTime + additionalTime
    };

    setAnalytics(updatedAnalytics);

    // Update view time in database
    await supabase
      .from('diamond_views')
      .update({
        total_view_time: updatedAnalytics.totalViewTime,
        last_interaction: new Date().toISOString()
      })
      .eq('session_id', sessionId);
  }, [analytics]);

  const trackInteraction = useCallback(async (sessionId: string, interaction: string) => {
    if (!analytics) return;

    const updatedInteractions = [...analytics.interactions, interaction];
    setAnalytics(prev => prev ? { ...prev, interactions: updatedInteractions } : null);

    // Update interactions in database
    await supabase
      .from('diamond_views')
      .update({
        interactions: updatedInteractions,
        last_interaction: new Date().toISOString()
      })
      .eq('session_id', sessionId);
  }, [analytics]);

  const trackReshare = useCallback(async (sessionId: string) => {
    if (!analytics) return;

    setAnalytics(prev => prev ? { ...prev, reshared: true } : null);

    await supabase
      .from('diamond_views')
      .update({
        reshared: true,
        last_interaction: new Date().toISOString()
      })
      .eq('session_id', sessionId);
  }, [analytics]);

  return {
    shareWithInlineButton,
    trackView,
    updateViewTime,
    trackInteraction,
    trackReshare,
    isSharing,
    analytics,
    isAvailable: !!(webApp && user)
  };
}
