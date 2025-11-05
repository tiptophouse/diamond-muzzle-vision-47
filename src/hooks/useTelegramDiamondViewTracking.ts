import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from './useTelegramWebApp';

interface TrackDiamondViewParams {
  diamondStockNumber: string;
  source?: string;
  referrerData?: any;
}

export function useTelegramDiamondViewTracking() {
  const { webApp, user } = useTelegramWebApp();

  const trackDiamondView = useCallback(async ({ 
    diamondStockNumber, 
    source = 'telegram_message',
    referrerData 
  }: TrackDiamondViewParams) => {
    try {
      if (!user?.id) {
        console.log('⚠️ No user ID available for tracking');
        return;
      }

      const viewData = {
        viewer_telegram_id: user.id,
        diamond_stock_number: diamondStockNumber,
        source,
        referrer_data: referrerData || {
          platform: webApp?.platform,
          version: webApp?.version,
          initData: webApp?.initData,
        },
        viewed_at: new Date().toISOString(),
      };

      console.log('📊 Tracking diamond view:', viewData);

      const { error } = await supabase
        .from('telegram_diamond_views')
        .insert(viewData);

      if (error) {
        console.error('❌ Failed to track diamond view:', error);
        return;
      }

      console.log('✅ Diamond view tracked successfully');
    } catch (err) {
      console.error('❌ Error tracking diamond view:', err);
    }
  }, [user, webApp]);

  // Auto-track when component mounts if opened from Telegram web_app
  const autoTrackView = useCallback((stockNumber: string) => {
    if (!stockNumber) return;

    // Check if opened from Telegram web_app button
    const isFromTelegram = !!webApp?.initData;

    if (isFromTelegram) {
      trackDiamondView({
        diamondStockNumber: stockNumber,
        source: 'telegram_message',
        referrerData: {
          is_from_web_app: true,
          telegram_platform: webApp?.platform,
        },
      });
    }
  }, [webApp, trackDiamondView]);

  return {
    trackDiamondView,
    autoTrackView,
  };
}
