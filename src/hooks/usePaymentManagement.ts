
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api, apiEndpoints } from '@/lib/api';

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  averagePayment: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
}

export function usePaymentManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const removeUserPayments = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage payments",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ PAYMENTS: Removing user payments with JWT authentication');
      
      const result = await api.delete(apiEndpoints.removeUserPayments());
      
      if (result.error) {
        console.error('❌ PAYMENTS: Remove user payments failed:', result.error);
        toast({
          title: "Remove Failed ❌",
          description: `Failed to remove payments: ${result.error}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ PAYMENTS: User payments removed successfully');
      toast({
        title: "Success ✅",
        description: "Your payments have been removed successfully",
      });
      
      return true;
    } catch (error) {
      console.error('❌ PAYMENTS: Failed to remove payments:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove payments";
      toast({
        title: "Remove Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAllPayments = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage payments",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ PAYMENTS: Removing all payments with JWT authentication');
      
      const result = await api.delete(apiEndpoints.removeAllPayments());
      
      if (result.error) {
        console.error('❌ PAYMENTS: Remove all payments failed:', result.error);
        toast({
          title: "Remove Failed ❌",
          description: `Failed to remove all payments: ${result.error}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ PAYMENTS: All payments removed successfully');
      toast({
        title: "Success ✅",
        description: "All payments have been removed successfully",
      });
      
      return true;
    } catch (error) {
      console.error('❌ PAYMENTS: Failed to remove all payments:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove all payments";
      toast({
        title: "Remove Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPayments = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view payments",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      console.log('💰 PAYMENTS: Getting user payments with JWT authentication');
      
      const result = await api.get(apiEndpoints.getUserPayments());
      
      if (result.error) {
        console.error('❌ PAYMENTS: Get user payments failed:', result.error);
        toast({
          title: "Fetch Failed ❌",
          description: `Failed to get payments: ${result.error}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('✅ PAYMENTS: User payments retrieved successfully');
      return result.data;
    } catch (error) {
      console.error('❌ PAYMENTS: Failed to get payments:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get payments";
      toast({
        title: "Fetch Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStats = async (): Promise<PaymentStats | null> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view payment statistics",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      console.log('📊 PAYMENTS: Getting payment stats with JWT authentication');
      
      const result = await api.get(apiEndpoints.getPaymentStats());
      
      if (result.error) {
        console.error('❌ PAYMENTS: Get payment stats failed:', result.error);
        toast({
          title: "Stats Failed ❌",
          description: `Failed to get payment statistics: ${result.error}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('✅ PAYMENTS: Payment stats retrieved successfully');
      return result.data as PaymentStats;
    } catch (error) {
      console.error('❌ PAYMENTS: Failed to get payment stats:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get payment statistics";
      toast({
        title: "Stats Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    removeUserPayments,
    removeAllPayments,
    getUserPayments,
    getPaymentStats,
  };
}
