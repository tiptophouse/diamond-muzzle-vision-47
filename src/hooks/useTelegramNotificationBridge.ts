import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

export function useTelegramNotificationBridge() {
  const { webApp, user } = useTelegramWebApp();
  const { toast } = useToast();

  useEffect(() => {
    if (!webApp || !user) return;

    console.log('🔧 Telegram bridge initialized for user:', user.id);
    console.log('🔧 WebApp init data:', webApp.initData);
    console.log('🔧 WebApp start param:', (webApp as any).initDataUnsafe?.start_param);

    // Listen for data sent from your chatbot to the mini app
    const handleDataReceived = async (data: string) => {
      try {
        console.log('📨 Received data from chatbot:', data);
        
        // Parse the notification data sent from your chatbot
        const notificationData = JSON.parse(data);
        
        // Save to notifications table
        const { error } = await supabase
          .from('notifications')
          .insert({
            telegram_id: user.id,
            message_type: notificationData.type || 'diamond_match',
            message_content: notificationData.message || notificationData.content,
            metadata: {
              ...notificationData,
              source: 'chatbot',
              received_at: new Date().toISOString()
            },
            status: 'delivered'
          });

        if (error) {
          console.error('❌ Failed to save notification:', error);
          return;
        }

        // Show toast notification
        toast({
          title: "התראה חדשה",
          description: notificationData.message || "התקבלה התראה חדשה מהצ'אטבוט",
        });

        console.log('✅ Notification saved successfully');
        
      } catch (error) {
        console.error('❌ Error processing chatbot notification:', error);
      }
    };

    // Check for start parameter on initial load
    const checkStartParam = () => {
      const startParam = (webApp as any).initDataUnsafe?.start_param;
      if (startParam) {
        console.log('🚀 Found start param:', startParam);
        handleDataReceived(startParam);
      }

      // Also check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const notificationData = urlParams.get('notification_data');
      if (notificationData) {
        console.log('🔗 Found URL notification data:', notificationData);
        handleDataReceived(decodeURIComponent(notificationData));
      }
    };

    // Check immediately
    checkStartParam();

    // Set up event listeners
    webApp.onEvent('main_button_pressed', () => {
      console.log('🔘 Main button pressed');
    });

    webApp.onEvent('web_app_data_received', () => {
      console.log('📡 WebApp data received event');
      checkStartParam();
    });

    // Listen for viewport changes (might indicate new data)
    webApp.onEvent('viewport_changed', () => {
      console.log('📱 Viewport changed, checking for new data');
      checkStartParam();
    });

    return () => {
      // Cleanup if needed
    };
  }, [webApp, user, toast]);

  // Function to manually trigger a test notification
  const createTestNotification = async (message: string, type: string = 'info') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          telegram_id: user.id,
          message_type: type,
          message_content: message,
          metadata: {
            source: 'test',
            created_at: new Date().toISOString()
          },
          status: 'delivered'
        });

      if (!error) {
        toast({
          title: "Test Notification Created",
          description: message,
        });
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  return {
    createTestNotification
  };
}