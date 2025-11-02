import { useState } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import type { 
  BillingResponse, 
  UpdatePaymentMethodResponse,
  CancelSubscriptionResponse 
} from '@/types/fastapi-models';
import { toast } from 'sonner';

export function useBilling() {
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState<BillingResponse | null>(null);

  /**
   * Get billing details and active subscriptions
   */
  const getBillingDetails = async (): Promise<BillingResponse | null> => {
    setLoading(true);
    try {
      const { data, error } = await api.get<BillingResponse>(apiEndpoints.getBilling());
      
      if (error) {
        toast.error('Failed to load billing information');
        console.error('Billing error:', error);
        return null;
      }

      if (data) {
        setBillingData(data);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Billing exception:', error);
      toast.error('Failed to load billing information');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get active subscription status
   */
  const getActiveSubscription = async (): Promise<UpdatePaymentMethodResponse | null> => {
    setLoading(true);
    try {
      const { data, error } = await api.get<UpdatePaymentMethodResponse>(
        apiEndpoints.getActiveSubscription()
      );
      
      if (error) {
        console.error('Active subscription error:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Active subscription exception:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create payment URL for updating payment method
   */
  const createPaymentUrl = async (): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await api.post<UpdatePaymentMethodResponse>(
        apiEndpoints.updatePaymentMethod(),
        {}
      );
      
      if (error) {
        toast.error('Failed to create payment URL');
        console.error('Payment URL error:', error);
        return null;
      }

      if (data?.payment_url) {
        toast.success('Payment page ready');
        return data.payment_url;
      }

      toast.error('No payment URL received');
      return null;
    } catch (error) {
      console.error('Payment URL exception:', error);
      toast.error('Failed to create payment URL');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel active subscription
   */
  const cancelSubscription = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await api.post<CancelSubscriptionResponse>(
        apiEndpoints.cancelSubscription(),
        {}
      );
      
      if (error) {
        toast.error('Failed to cancel subscription');
        console.error('Cancel subscription error:', error);
        return false;
      }

      if (data?.success) {
        toast.success(data.message || 'Subscription cancelled successfully');
        // Refresh billing data
        await getBillingDetails();
        return true;
      }

      toast.error(data?.message || 'Failed to cancel subscription');
      return false;
    } catch (error) {
      console.error('Cancel subscription exception:', error);
      toast.error('Failed to cancel subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    billingData,
    getBillingDetails,
    getActiveSubscription,
    createPaymentUrl,
    cancelSubscription,
  };
}
