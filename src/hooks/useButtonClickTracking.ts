import { useCallback } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from './useTelegramWebApp';

export interface ButtonClickEvent {
  button_id: string;
  button_label: string;
  page_path: string;
  user_telegram_id: number;
  user_name: string;
  timestamp: string;
  user_agent: string;
  session_id?: string;
  context?: Record<string, any>;
}

export function useButtonClickTracking() {
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramWebApp();

  const trackButtonClick = useCallback(async (
    buttonId: string,
    buttonLabel: string,
    context?: Record<string, any>
  ) => {
    if (!user?.id) {
      console.warn('⚠️ Cannot track button click - no user ID');
      return;
    }

    const eventData: ButtonClickEvent = {
      button_id: buttonId,
      button_label: buttonLabel,
      page_path: window.location.pathname,
      user_telegram_id: user.id,
      user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      session_id: webApp?.initDataUnsafe?.query_id,
      context
    };

    try {
      // Store in Supabase
      const { error } = await supabase
        .from('button_click_events')
        .insert({
          telegram_id: user.id,
          button_id: buttonId,
          button_label: buttonLabel,
          page_path: window.location.pathname,
          user_name: eventData.user_name,
          user_agent: eventData.user_agent,
          session_id: eventData.session_id,
          context: context || {},
          clicked_at: eventData.timestamp
        });

      if (error) {
        console.error('❌ Failed to track button click:', error);
      } else {
        console.log('✅ Button click tracked:', buttonId, buttonLabel);
      }

      // Also send to Telegram backend if available
      if (webApp?.sendData) {
        webApp.sendData(JSON.stringify({
          action: 'button_click',
          data: eventData,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('❌ Error tracking button click:', error);
    }
  }, [user, webApp]);

  return { trackButtonClick };
}
