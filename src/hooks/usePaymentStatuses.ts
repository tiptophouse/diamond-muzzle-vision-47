import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/config';

interface PaymentStatus {
  user_id: number;
  expiration_date?: string;
  is_renewable?: boolean;
  is_active: boolean;
  subscription_type?: string;
}

interface PaymentStatusMap {
  [userId: number]: PaymentStatus;
}

export function usePaymentStatuses(userIds: number[]) {
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatusMap>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchPaymentStatuses = async () => {
      setIsLoading(true);
      const statusMap: PaymentStatusMap = {};

      // Fetch payment status for each user
      for (const userId of userIds) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/v1/user/active-subscription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId })
          });

          if (response.ok) {
            const data = await response.json();
            statusMap[userId] = data;
          } else {
            // Default to inactive if fetch fails
            statusMap[userId] = {
              user_id: userId,
              is_active: false,
              subscription_type: 'none'
            };
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error fetching payment status for user ${userId}:`, error);
          statusMap[userId] = {
            user_id: userId,
            is_active: false,
            subscription_type: 'none'
          };
        }
      }

      setPaymentStatuses(statusMap);
      setIsLoading(false);
    };

    fetchPaymentStatuses();
  }, [userIds.join(',')]);

  return { paymentStatuses, isLoading };
}
