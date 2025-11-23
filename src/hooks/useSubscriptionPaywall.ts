import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';

interface SubscriptionStatus {
  has_active_subscription: boolean;
  message: string;
}

export function useSubscriptionPaywall() {
  const { user } = useTelegramAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkSubscriptionStatus();
    }
  }, [user?.id]);

  const checkSubscriptionStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Checking subscription status for paywall:', user.id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('❌ Error checking subscription:', error);
        setIsBlocked(true);
      } else {
        console.log('✅ Subscription status:', data);
        setSubscriptionStatus(data);
        setIsBlocked(!data?.has_active_subscription);
      }
    } catch (error) {
      console.error('❌ Exception checking subscription:', error);
      setIsBlocked(true);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPaymentLink = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      console.log('📤 Requesting payment link via Telegram bot...');
      
      const { data, error } = await supabase.functions.invoke('send-telegram-bot-command', {
        body: { 
          telegram_id: user.id,
          command: '/start'
        }
      });

      if (error) {
        console.error('❌ Error requesting payment:', error);
        toast.error('Failed to request payment link');
      } else {
        console.log('✅ Payment request sent:', data);
        toast.success('Payment link sent to your Telegram chat! Check your messages.');
      }
    } catch (error) {
      console.error('❌ Exception requesting payment:', error);
      toast.error('Failed to send payment request');
    }
  };

  return {
    subscriptionStatus,
    isLoading,
    isBlocked,
    requestPaymentLink,
    refetch: checkSubscriptionStatus
  };
}
