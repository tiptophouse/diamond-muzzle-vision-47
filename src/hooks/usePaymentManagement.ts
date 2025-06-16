
import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface PaymentStats {
  totalUsers: number;
  usersWithPayments: number;
  totalPayments: number;
}

export function usePaymentManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const removeUserPayments = async (userId: number) => {
    setIsLoading(true);
    try {
      console.log('🗑️ Removing payments for user:', userId);
      const response = await api.delete(apiEndpoints.removeUserPayments(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Payments Removed",
        description: `Successfully removed all payment data for user ${userId}`,
      });

      // Refresh stats after removal
      await getPaymentStats();
      return true;
    } catch (error) {
      console.error('❌ Error removing user payments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user payments",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAllPayments = async () => {
    setIsLoading(true);
    try {
      console.log('🗑️ Removing all payment data');
      const response = await api.delete(apiEndpoints.removeAllPayments());
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "All Payments Removed",
        description: "Successfully removed all payment data from the system",
      });

      // Refresh stats after removal
      await getPaymentStats();
      return true;
    } catch (error) {
      console.error('❌ Error removing all payments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove all payments",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeMyselfFromPayments = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    return await removeUserPayments(user.id);
  };

  const getUserPayments = async (userId: number) => {
    try {
      console.log('📊 Fetching payments for user:', userId);
      const response = await api.get(apiEndpoints.getUserPayments(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user payments",
        variant: "destructive",
      });
      return null;
    }
  };

  const getPaymentStats = async () => {
    try {
      console.log('📊 Fetching payment statistics');
      const response = await api.get(apiEndpoints.getPaymentStats());
      
      if (response.error) {
        throw new Error(response.error);
      }

      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payment stats:', error);
      return null;
    }
  };

  return {
    isLoading,
    stats,
    removeUserPayments,
    removeAllPayments,
    removeMyselfFromPayments,
    getUserPayments,
    getPaymentStats,
  };
}
