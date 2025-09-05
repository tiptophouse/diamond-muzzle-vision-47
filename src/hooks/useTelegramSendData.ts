import { useCallback } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';

export interface TelegramSendDataPayload {
  action: string;
  data: any;
  timestamp: number;
}

export function useTelegramSendData() {
  const { webApp } = useTelegramWebApp();

  const sendData = useCallback((payload: TelegramSendDataPayload) => {
    console.log('🔍 SHARE DEBUG: Attempting to send data via Telegram WebApp');
    console.log('📱 WebApp available:', !!webApp);
    console.log('📱 SendData function available:', !!webApp?.sendData);
    console.log('📤 Payload:', payload);
    
    if (webApp?.sendData) {
      try {
        const dataString = JSON.stringify(payload);
        console.log('📤 Sending data string:', dataString);
        webApp.sendData(dataString);
        console.log('✅ Data sent to Telegram bot successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed to send data to Telegram bot:', error);
        return false;
      }
    } else {
      console.warn('⚠️ Telegram WebApp not available for sending data');
      console.warn('🔍 Current environment:', {
        isTelegram: !!window.Telegram,
        webApp: !!webApp,
        sendData: !!webApp?.sendData,
        userAgent: navigator.userAgent
      });
      return false;
    }
  }, [webApp]);

  // Specific helper functions for common actions
  const reportError = useCallback((error: Error, context?: string) => {
    return sendData({
      action: 'error_report',
      data: {
        message: error.message,
        stack: error.stack,
        context: context || 'unknown',
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      timestamp: Date.now()
    });
  }, [sendData]);

  const reportUserAction = useCallback((action: string, details?: any) => {
    return sendData({
      action: 'user_action',
      data: {
        action,
        details,
        page: window.location.pathname
      },
      timestamp: Date.now()
    });
  }, [sendData]);

  const reportDiamondInteraction = useCallback((type: 'view' | 'contact' | 'share' | 'upload', diamondData?: any) => {
    return sendData({
      action: 'diamond_interaction',
      data: {
        type,
        diamond: diamondData,
        page: window.location.pathname
      },
      timestamp: Date.now()
    });
  }, [sendData]);

  const requestUploadReminder = useCallback((reason: string) => {
    return sendData({
      action: 'upload_reminder_request',
      data: {
        reason,
        currentPage: window.location.pathname,
        hasInventory: false // This could be determined from context
      },
      timestamp: Date.now()
    });
  }, [sendData]);

  const reportDailyStats = useCallback((stats: any) => {
    return sendData({
      action: 'daily_stats',
      data: stats,
      timestamp: Date.now()
    });
  }, [sendData]);

  return {
    sendData,
    reportError,
    reportUserAction,
    reportDiamondInteraction,
    requestUploadReminder,
    reportDailyStats,
    isAvailable: !!webApp?.sendData
  };
}