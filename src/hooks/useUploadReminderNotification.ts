import { useEffect, useRef } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryData } from './useInventoryData';
import { supabase } from '@/integrations/supabase/client';

const REMINDER_DELAY = 2 * 60 * 1000; // 2 minutes in milliseconds

export function useUploadReminderNotification() {
  const { user } = useTelegramAuth();
  const { diamonds, loading } = useInventoryData();
  const reminderSentRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || loading) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If user already has diamonds or reminder already sent, don't set timer
    if (diamonds.length > 0 || reminderSentRef.current) {
      return;
    }

    // Set timer to send reminder after 2 minutes
    timerRef.current = setTimeout(async () => {
      if (diamonds.length === 0 && !reminderSentRef.current) {
        await sendUploadReminder(user.id);
        reminderSentRef.current = true;
      }
    }, REMINDER_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, diamonds.length, loading]);

  // Reset reminder flag when diamonds are uploaded
  useEffect(() => {
    if (diamonds.length > 0) {
      reminderSentRef.current = true; // Mark as sent to prevent future reminders
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [diamonds.length]);
}

async function sendUploadReminder(telegramId: number) {
  try {
    console.log('📬 Sending upload reminder to user:', telegramId);
    
    const { data, error } = await supabase.functions.invoke('send-upload-reminder', {
      body: { telegramId }
    });

    if (error) {
      console.error('❌ Failed to send upload reminder:', error);
    } else {
      console.log('✅ Upload reminder sent successfully:', data);
    }
  } catch (error) {
    console.error('❌ Error sending upload reminder:', error);
  }
}