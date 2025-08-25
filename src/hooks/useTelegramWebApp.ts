
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<typeof WebApp | null>(null);

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
      setWebApp(WebApp);
    }
  }, []);

  return { webApp };
}
