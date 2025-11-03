import { useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramSDK2Context } from '@/providers/TelegramSDK2Provider';
import { supabase } from '@/integrations/supabase/client';

export function useTrackButtonClick() {
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramSDK2Context();

  useEffect(() => {
    if (!user || !webApp) return;

    const trackClick = async () => {
      try {
        // Get start parameter from Telegram Web App
        const startParam = webApp.initDataUnsafe?.start_param;
        
        if (!startParam || !startParam.includes('_from_group')) {
          return; // Not from a group button click
        }

        // Parse target page from start parameter
        const targetPage = startParam.replace('_from_group', '');
        
        // Generate button ID and label based on target page
        const buttonMap: Record<string, { id: string; label: string }> = {
          'ai': { id: 'ai', label: '🤖 AI Assistant' },
          'inventory': { id: 'inventory', label: '💎 My Inventory' },
          'dashboard': { id: 'dashboard', label: '📊 Dashboard' },
          'notifications': { id: 'notifications', label: '🔔 Notifications' },
          'analytics': { id: 'analytics', label: '📈 Analytics' }
        };

        const buttonInfo = buttonMap[targetPage] || {
          id: targetPage,
          label: targetPage.charAt(0).toUpperCase() + targetPage.slice(1)
        };

        console.log('📊 Tracking button click:', {
          userId: user.id,
          targetPage,
          buttonInfo
        });

        // Track the click
        const { error } = await supabase.functions.invoke('track-button-click', {
          body: {
            telegramUserId: user.id,
            userFirstName: user.first_name,
            userUsername: user.username,
            buttonId: buttonInfo.id,
            buttonLabel: buttonInfo.label,
            targetPage
          }
        });

        if (error) {
          console.error('Failed to track button click:', error);
        } else {
          console.log('✅ Button click tracked successfully');
        }
      } catch (error) {
        console.error('Error tracking button click:', error);
      }
    };

    trackClick();
  }, [user, webApp]);
}
