import { useState, useEffect } from 'react';
import { http } from '@/api/http';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  has_active_subscription: boolean;
  message: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff
const isDevelopment = import.meta.env.DEV;

export function useSubscriptionPaywall() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      checkSubscriptionWithRetry();
    } else if (!user?.id) {
      // No user yet, stay in loading state
      setIsLoading(true);
      setIsBlocked(false);
    }
  }, [user?.id, isAuthenticated]);

  const checkSubscriptionWithRetry = async (attempt = 0) => {
    if (!user?.id) {
      setIsLoading(false);
      setIsBlocked(false);
      return;
    }

    setIsLoading(true);
    setRetryCount(attempt);

    try {
      console.log('🔍 SUBSCRIPTION CHECK:', {
        userId: user.id,
        attempt: attempt + 1,
        maxRetries: MAX_RETRIES,
        timestamp: new Date().toISOString()
      });
      
      // Call FastAPI directly with JWT authentication
      const data = await http<SubscriptionStatus>('/api/v1/user/active-subscription', {
        method: 'GET',
      });

      console.log('✅ Subscription response:', data);
      setSubscriptionStatus(data);
      
      // CRITICAL: Only block if backend explicitly says no subscription
      const shouldBlock = !data?.has_active_subscription;
      setIsBlocked(shouldBlock);
      
      console.log('🚪 PAYWALL DECISION:', {
        isBlocked: shouldBlock,
        hasSubscription: data?.has_active_subscription,
        message: data?.message,
        timestamp: new Date().toISOString()
      });
      
      setIsLoading(false);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error(`❌ Subscription check error (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        error: errorMessage,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // Auth errors (401/403) - JWT not ready or expired, retry
      if ((errorMessage.includes('401') || errorMessage.includes('403')) && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`⏳ Auth not ready, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkSubscriptionWithRetry(attempt + 1);
      }
      
      // Network errors or max retries reached - FAIL OPEN (don't block)
      console.warn('⚠️ FAIL-OPEN: Failed to verify subscription, allowing access by default', {
        reason: attempt >= MAX_RETRIES ? 'max retries' : 'network error',
        isDevelopment
      });
      
      // In development, always fail open
      if (isDevelopment) {
        console.warn('🔧 DEV MODE: Allowing access despite subscription check failure');
      }
      
      // Default to NOT blocking - fail-open for reliability
      setIsBlocked(false);
      setSubscriptionStatus({
        has_active_subscription: false,
        message: 'Unable to verify subscription status. Granting temporary access.'
      });
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = () => {
    setRetryCount(0);
    return checkSubscriptionWithRetry(0);
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
