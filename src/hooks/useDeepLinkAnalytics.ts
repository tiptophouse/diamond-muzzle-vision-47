import { useEffect, useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useTelegramSendData } from './useTelegramSendData';
import { useTelegramCloudStorage } from './useTelegramCloudStorage';

export interface DeepLinkEvent {
  type: 'app_open' | 'deep_link_arrival' | 'navigation';
  start_param?: string;
  route?: string;
  timestamp: number;
}

export function useDeepLinkAnalytics() {
  const { webApp, user } = useTelegramWebApp();
  const { sendData, isAvailable: sendDataAvailable } = useTelegramSendData();
  const { setItem, getItem, isSupported: cloudStorageSupported } = useTelegramCloudStorage();

  // Track app open
  const trackAppOpen = useCallback(async () => {
    const event: DeepLinkEvent = {
      type: 'app_open',
      timestamp: Date.now()
    };

    // Send to Telegram
    if (sendDataAvailable) {
      sendData({
        action: 'analytics_app_open',
        data: {
          user_id: user?.id,
          platform: webApp?.platform,
          version: webApp?.version
        },
        timestamp: event.timestamp
      });
    }

    // Update cloud storage counter
    if (cloudStorageSupported) {
      try {
        const currentCount = await getItem('stats/app_opens');
        const count = currentCount ? parseInt(currentCount) : 0;
        await setItem('stats/app_opens', String(count + 1));
      } catch (error) {
        console.error('Failed to update app_opens counter:', error);
      }
    }
  }, [webApp, user, sendData, sendDataAvailable, cloudStorageSupported, setItem, getItem]);

  // Track deep link arrival
  const trackDeepLinkArrival = useCallback(async (startParam: string) => {
    const event: DeepLinkEvent = {
      type: 'deep_link_arrival',
      start_param: startParam,
      timestamp: Date.now()
    };

    // Send to Telegram
    if (sendDataAvailable) {
      sendData({
        action: 'analytics_deep_link',
        data: {
          user_id: user?.id,
          start_param: startParam,
          platform: webApp?.platform
        },
        timestamp: event.timestamp
      });
    }

    // Update cloud storage counters
    if (cloudStorageSupported) {
      try {
        // Total deep links
        const totalCount = await getItem('stats/deep_link_total');
        const total = totalCount ? parseInt(totalCount) : 0;
        await setItem('stats/deep_link_total', String(total + 1));

        // By type (diamond, store, auction, offer, etc.)
        const prefix = startParam.split('_')[0];
        const typeKey = `stats/deep_links_by_type/${prefix}`;
        const typeCount = await getItem(typeKey);
        const count = typeCount ? parseInt(typeCount) : 0;
        await setItem(typeKey, String(count + 1));
      } catch (error) {
        console.error('Failed to update deep_link counters:', error);
      }
    }
  }, [webApp, user, sendData, sendDataAvailable, cloudStorageSupported, setItem, getItem]);

  // Track navigation
  const trackNavigation = useCallback(async (route: string, startParam?: string) => {
    const event: DeepLinkEvent = {
      type: 'navigation',
      route,
      start_param: startParam,
      timestamp: Date.now()
    };

    // Send to Telegram
    if (sendDataAvailable) {
      sendData({
        action: 'analytics_navigation',
        data: {
          user_id: user?.id,
          route,
          start_param: startParam,
          platform: webApp?.platform
        },
        timestamp: event.timestamp
      });
    }

    // Update cloud storage counter
    if (cloudStorageSupported) {
      try {
        const routeKey = `stats/navigations/${route.replace(/\//g, '_')}`;
        const routeCount = await getItem(routeKey);
        const count = routeCount ? parseInt(routeCount) : 0;
        await setItem(routeKey, String(count + 1));
      } catch (error) {
        console.error('Failed to update navigation counter:', error);
      }
    }
  }, [webApp, user, sendData, sendDataAvailable, cloudStorageSupported, setItem, getItem]);

  // Get analytics stats
  const getAnalyticsStats = useCallback(async () => {
    if (!cloudStorageSupported) {
      return null;
    }

    try {
      const appOpens = await getItem('stats/app_opens');
      const deepLinkTotal = await getItem('stats/deep_link_total');
      
      return {
        app_opens: appOpens ? parseInt(appOpens) : 0,
        deep_link_total: deepLinkTotal ? parseInt(deepLinkTotal) : 0
      };
    } catch (error) {
      console.error('Failed to get analytics stats:', error);
      return null;
    }
  }, [cloudStorageSupported, getItem]);

  return {
    trackAppOpen,
    trackDeepLinkArrival,
    trackNavigation,
    getAnalyticsStats,
    isAvailable: sendDataAvailable || cloudStorageSupported
  };
}
