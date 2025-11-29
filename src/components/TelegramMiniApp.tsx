import React, { useEffect, useState } from 'react';
import { useTelegramPerformance } from '@/hooks/useTelegramPerformance';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramSDKInit } from '@/hooks/useTelegramSDKInit';
import { logger } from '@/utils/logger';

interface TelegramMiniAppProps {
  children: React.ReactNode;
}

export function TelegramMiniApp({ children }: TelegramMiniAppProps) {
  const { webApp, isReady } = useTelegramWebApp();
  const { isOptimized, metrics } = useTelegramPerformance();
  const { isSDKReady } = useTelegramSDKInit(); // Initialize SDK with best practices
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);

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

  // Emergency timeout fallback - show UI after 3 seconds maximum
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (!isReady) {
        logger.error('Emergency mode activated - Telegram SDK init timeout');
        setShowEmergencyMode(true);
      }
    }, 3000);

    return () => clearTimeout(emergencyTimeout);
  }, [isReady]);

  if (!isReady && !showEmergencyMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-3 border-primary/20 rounded-full animate-ping" style={{ animationDuration: '1s' }}></div>
            <div className="absolute inset-0 border-3 border-primary border-t-transparent rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-base font-medium text-foreground mb-1">Loading BrilliantBot</p>
          <p className="text-sm text-muted-foreground">Initializing Telegram Mini App...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}