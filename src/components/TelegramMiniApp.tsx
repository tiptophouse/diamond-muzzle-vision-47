import React, { useEffect } from 'react';
import { useTelegramPerformance } from '@/hooks/useTelegramPerformance';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { logger } from '@/utils/logger';

interface TelegramMiniAppProps {
  children: React.ReactNode;
}

export function TelegramMiniApp({ children }: TelegramMiniAppProps) {
  const { webApp, isReady } = useTelegramWebApp();
  const { isOptimized, metrics } = useTelegramPerformance();

  useEffect(() => {
    if (isReady && webApp) {
      logger.telegramAction('mini_app_initialized', {
        isOptimized,
        platform: webApp.platform,
        version: webApp.version,
        colorScheme: webApp.colorScheme,
        metrics
      });

      // Report performance metrics periodically
      const reportInterval = setInterval(() => {
        if (metrics) {
          logger.info('Performance metrics', {
            loadTime: metrics.loadTime,
            memoryUsage: metrics.memoryUsage,
            viewport: metrics.viewport,
            connectionType: metrics.connectionType
          });
        }
      }, 60000); // Every minute

      return () => {
        clearInterval(reportInterval);
      };
    }
  }, [isReady, webApp, isOptimized, metrics]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Telegram Mini App...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}