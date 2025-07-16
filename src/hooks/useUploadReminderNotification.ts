import { useEffect, useRef } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryData } from './useInventoryData';
import { supabase } from '@/integrations/supabase/client';

const REMINDER_DELAY = 10 * 1000; // 10 seconds for testing (change back to 2 * 60 * 1000 for production)

export function useUploadReminderNotification() {
  const { user } = useTelegramAuth();
  const { diamonds, loading } = useInventoryData();
  const reminderSentRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔔 Upload reminder hook - user:', user?.id, 'loading:', loading, 'diamonds:', diamonds.length);
    
    if (!user || loading) {
      console.log('🔔 Upload reminder hook - waiting for user or loading');
      return;
    }

    // Clear existing timer
    if (timerRef.current) {
      console.log('🔔 Upload reminder hook - clearing existing timer');
      clearTimeout(timerRef.current);
    }

    // If user already has diamonds or reminder already sent, don't set timer
    if (diamonds.length > 0 || reminderSentRef.current) {
      console.log('🔔 Upload reminder hook - skipping timer (diamonds:', diamonds.length, 'reminderSent:', reminderSentRef.current, ')');
      return;
    }

    console.log('🔔 Upload reminder hook - setting 2 minute timer');
    // Set timer to send reminder after 2 minutes
    timerRef.current = setTimeout(async () => {
      console.log('🔔 Upload reminder hook - timer fired! Checking conditions...');
      if (diamonds.length === 0 && !reminderSentRef.current) {
        console.log('🔔 Upload reminder hook - sending reminder to user:', user.id);
        await sendUploadReminder(user.id);
        reminderSentRef.current = true;
      } else {
        console.log('🔔 Upload reminder hook - conditions not met (diamonds:', diamonds.length, 'reminderSent:', reminderSentRef.current, ')');
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
    console.log('🔔 Upload reminder hook - diamonds effect triggered, count:', diamonds.length);
    if (diamonds.length > 0) {
      console.log('🔔 Upload reminder hook - user has diamonds, marking reminder as sent and clearing timer');
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