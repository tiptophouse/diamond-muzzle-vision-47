import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

export function useTelegramNotificationBridge() {
  const { webApp, user } = useTelegramWebApp();
  const { toast } = useToast();

  useEffect(() => {
    if (!webApp || !user) return;

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
          title: "New Notification",
          description: notificationData.message || "You have a new notification from your chatbot",
        });

        console.log('✅ Notification saved successfully');
        
      } catch (error) {
        console.error('❌ Error processing chatbot notification:', error);
      }
    };

    // Set up event listener for data from chatbot
    webApp.onEvent('main_button_pressed', () => {
      // Handle main button if needed
    });

    // Listen for custom events or data
    webApp.onEvent('web_app_data_received', () => {
      // Check if there's data in the WebApp
      if ((webApp as any).initDataUnsafe?.start_param) {
        handleDataReceived((webApp as any).initDataUnsafe.start_param);
      }
    });

    // Alternative: Check for data on window focus (in case chatbot sets data)
    const handleWindowFocus = () => {
      if (webApp.initData && webApp.initData.includes('notification_data')) {
        try {
          const urlParams = new URLSearchParams(webApp.initData);
          const notificationData = urlParams.get('notification_data');
          if (notificationData) {
            handleDataReceived(notificationData);
          }
        } catch (error) {
          console.error('Error parsing URL data:', error);
        }
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
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