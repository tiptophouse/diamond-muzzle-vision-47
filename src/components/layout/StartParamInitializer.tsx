import { useEffect } from 'react';
import { useStartParamRouter } from '@/hooks/useStartParamRouter';
import { useDeepLinkAnalytics } from '@/hooks/useDeepLinkAnalytics';

/**
 * Component that initializes start parameter routing and analytics
 * Should be rendered at the top level of the app
 */
export function StartParamInitializer() {
  useStartParamRouter();
  const { trackAppOpen } = useDeepLinkAnalytics();

  useEffect(() => {
    // Track app open on mount
    trackAppOpen();
  }, [trackAppOpen]);

  return null;
}