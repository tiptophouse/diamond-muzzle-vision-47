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
        <div className="text-center animate-fade-in">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping" style={{ animationDuration: '1.2s' }}></div>
            <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}