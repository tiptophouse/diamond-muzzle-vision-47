
import { useCallback, useEffect } from 'react';
import { useTelegramSendData } from './useTelegramSendData';
import { useEnhancedTelegramWebApp } from './useEnhancedTelegramWebApp';
import { Diamond } from '@/components/inventory/InventoryTable';

interface NotificationPreferences {
  priceDrops: boolean;
  certificateReminders: boolean;
  marketTrends: boolean;
  newMatches: boolean;
}

export function useSmartDiamondNotifications() {
  const { sendData, reportDiamondInteraction } = useTelegramSendData();
  const { showDiamondNotification, hapticFeedback } = useEnhancedTelegramWebApp();

  // Smart price drop notification
  const notifyPriceDrops = useCallback((diamonds: Diamond[], previousPrices: Record<string, number>) => {
    diamonds.forEach(diamond => {
      const previousPrice = previousPrices[diamond.stockNumber];
      if (previousPrice && diamond.price < previousPrice) {
        const savingsPercent = Math.round(((previousPrice - diamond.price) / previousPrice) * 100);
        
        showDiamondNotification(
          `💰 Price Drop Alert! ${diamond.carat}ct ${diamond.shape} is now ${savingsPercent}% off!`,
          'success'
        );

        // Send to bot for persistent notification
        sendData({
          action: 'price_drop_alert',
          data: {
            diamond: {
              stockNumber: diamond.stockNumber,
              shape: diamond.shape,
              carat: diamond.carat,
              oldPrice: previousPrice,
              newPrice: diamond.price,
              savings: previousPrice - diamond.price,
              savingsPercent
            }
          },
          timestamp: Date.now()
        });
      }
    });
  }, [showDiamondNotification, sendData]);

  // Certificate expiry reminders
  const checkCertificateExpiry = useCallback((diamonds: Diamond[]) => {
    diamonds.forEach(diamond => {
      if (diamond.certificateNumber) {
        // GIA certificates typically don't expire, but lab-grown or other certs might
        // This is a placeholder for future enhancement
        const hasExpiringCert = false; // Implement expiry logic based on lab type
        
        if (hasExpiringCert) {
          showDiamondNotification(
            `📋 Certificate for ${diamond.stockNumber} needs renewal`,
            'warning'
          );
        }
      }
    });
  }, [showDiamondNotification]);

  // Market trend alerts
  const notifyMarketTrends = useCallback((trendData: any) => {
    if (trendData.significantChange) {
      showDiamondNotification(
        `📈 Market Alert: ${trendData.category} prices ${trendData.direction} by ${trendData.percentage}%`,
        trendData.direction === 'up' ? 'warning' : 'success'
      );

      sendData({
        action: 'market_trend_alert',
        data: trendData,
        timestamp: Date.now()
      });
    }
  }, [showDiamondNotification, sendData]);

  // New diamond matches based on wishlist
  const notifyNewMatches = useCallback((matches: Diamond[]) => {
    matches.forEach(diamond => {
      showDiamondNotification(
        `✨ New Match! ${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity}`,
        'success'
      );

      hapticFeedback.notification('success');

      reportDiamondInteraction('view', diamond);
    });
  }, [showDiamondNotification, hapticFeedback, reportDiamondInteraction]);

  // Upload reminder for empty inventory
  const remindToUpload = useCallback(() => {
    sendData({
      action: 'upload_reminder_request',
      data: {
        reason: 'empty_inventory',
        currentPage: window.location.pathname,
        hasInventory: false
      },
      timestamp: Date.now()
    });
  }, [sendData]);

  // Engagement boost notification
  const notifyEngagementBoost = useCallback((stats: { views: number; inquiries: number }) => {
    if (stats.views > 50 || stats.inquiries > 5) {
      showDiamondNotification(
        `🔥 Your diamonds are trending! ${stats.views} views, ${stats.inquiries} inquiries`,
        'success'
      );
    }
  }, [showDiamondNotification]);

  return {
    notifyPriceDrops,
    checkCertificateExpiry,
    notifyMarketTrends,
    notifyNewMatches,
    remindToUpload,
    notifyEngagementBoost
  };
}
