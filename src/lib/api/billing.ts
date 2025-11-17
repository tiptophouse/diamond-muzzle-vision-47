/**
 * Billing & Subscription API Client
 * Handles all billing, subscription, and payment-related endpoints
 */

import { http } from '@/api/http';
import type {
  BillingResponse,
  UpdatePaymentMethodResponse,
  CancelSubscriptionResponse,
  PaymentMethodUpdate,
  CancelSubscriptionRequest,
} from '@/types/backend-api';

/**
 * Get complete billing information for the authenticated user
 * @returns User info, active subscriptions, and subscription status
 */
export async function getBilling(): Promise<BillingResponse> {
  return http<BillingResponse>('/api/v1/billing', {
    method: 'GET',
  });
}

/**
 * Cancel all active subscriptions for the authenticated user
 * @returns Success status and message
 */
export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  return http<CancelSubscriptionResponse>('/api/v1/billing/cancel-subscription', {
    method: 'POST',
  });
}

/**
 * Generate payment URL for updating payment method
 * @returns Payment URL for card update
 */
export async function updatePaymentMethod(): Promise<UpdatePaymentMethodResponse> {
  return http<UpdatePaymentMethodResponse>('/api/v1/billing/update-payment-method', {
    method: 'POST',
  });
}

/**
 * Start a trial subscription
 * @param data Payment method details
 * @returns Payment URL
 */
export async function trialSubscribe(
  data: PaymentMethodUpdate
): Promise<UpdatePaymentMethodResponse> {
  return http<UpdatePaymentMethodResponse>('/api/v1/billing/trial-subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Purchase a subscription
 * @param data Payment method details
 * @returns Payment URL
 */
export async function buySubscription(
  data: PaymentMethodUpdate
): Promise<UpdatePaymentMethodResponse> {
  return http<UpdatePaymentMethodResponse>('/api/v1/billing/buy-subscribtion', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get active subscription for the authenticated user
 * @returns Active subscription details
 */
export async function getActiveSubscription(): Promise<UpdatePaymentMethodResponse> {
  return http<UpdatePaymentMethodResponse>('/api/v1/user/active-subscription', {
    method: 'GET',
  });
}

/**
 * Cancel subscription by user ID
 * @param userId User ID
 * @returns Cancellation response
 */
export async function cancelSubscriptionByUserId(
  userId: number
): Promise<CancelSubscriptionResponse> {
  return http<CancelSubscriptionResponse>('/api/v1/billing/cancell-subscribe', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}
