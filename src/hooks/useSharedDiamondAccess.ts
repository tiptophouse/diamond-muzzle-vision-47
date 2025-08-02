
import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTelegramWebApp } from './useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSharedDiamondAccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, webApp } = useTelegramWebApp();

  const validateAndTrackAccess = useCallback(async (diamondId: string) => {
    const isShared = searchParams.get('shared');
    const sharedFrom = searchParams.get('from');

    if (!isShared || !sharedFrom) return true;

    // Only allow access via Telegram Mini App for shared links
    if (!webApp || !user) {
      toast.error('🔒 Shared diamonds can only be viewed in Telegram Mini App');
      return false;
    }

    try {
      // Track the shared diamond access
      await supabase.from('diamond_share_analytics').insert({
        diamond_stock_number: diamondId,
        owner_telegram_id: parseInt(sharedFrom),
        viewer_telegram_id: user.id,
        viewer_user_agent: navigator.userAgent,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        session_id: crypto.randomUUID(),
        access_via_share: true,
        referrer: document.referrer
      });

      // Clean up URL params after tracking
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('shared');
      newSearchParams.delete('from');
      setSearchParams(newSearchParams, { replace: true });

      console.log('✅ Shared diamond access tracked');
      return true;
    } catch (error) {
      console.error('❌ Failed to track shared diamond access:', error);
      return true; // Don't block access on tracking errors
    }
  }, [searchParams, setSearchParams, webApp, user]);

  const sendAccessNotification = useCallback(async (diamondId: string, ownerTelegramId: number) => {
    if (!user) return;

    try {
      // Notify the diamond owner about the view
      const notificationMessage = {
        action: 'shared_diamond_viewed',
        data: {
          diamondId,
          viewerName: user.first_name,
          viewerUsername: user.username,
          timestamp: Date.now()
        }
      };

      webApp?.sendData?.(JSON.stringify(notificationMessage));
    } catch (error) {
      console.error('❌ Failed to send access notification:', error);
    }
  }, [user, webApp]);

  return {
    validateAndTrackAccess,
    sendAccessNotification,
    isSecureAccess: !!(webApp && user)
  };
}
