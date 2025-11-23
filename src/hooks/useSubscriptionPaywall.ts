import { useState, useEffect } from 'react';
import { http } from '@/api/http';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const checkSubscriptionStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Checking subscription status from FastAPI:', user.id);
      
      // Call FastAPI directly with JWT authentication
      const data = await http<SubscriptionStatus>('/api/v1/user/active-subscription', {
        method: 'GET',
      });

      console.log('✅ Subscription status:', data);
      setSubscriptionStatus(data);
      setIsBlocked(!data?.has_active_subscription);
    } catch (error: any) {
      console.error('❌ Error checking subscription:', error);
      // On error, block access for safety
      setIsBlocked(true);
      setSubscriptionStatus({
        has_active_subscription: false,
        message: error?.message || 'Failed to verify subscription status'
      });
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
      
      // Call edge function to trigger Telegram bot
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
    } catch (error: any) {
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
