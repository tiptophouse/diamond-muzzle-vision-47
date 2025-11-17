/**
 * Search & Notifications API Client
 * Handles diamond search results and seller notifications
 */

import { http } from '@/api/http';
import type {
  SearchResultSchema,
  SellerNotificationSchema,
  SearchResultsParams,
  SellerNotificationsParams,
  SearchResultsCountParams,
} from '@/types/backend-api';

/**
 * Get search results for a user (buyer-centric view)
 * @param params Query parameters
 * @returns Array of search results
 */
export async function getSearchResults(
  params: SearchResultsParams
): Promise<SearchResultSchema[]> {
  const queryParams = new URLSearchParams({
    user_id: params.user_id.toString(),
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.offset && { offset: params.offset.toString() }),
    ...(params.result_type && { result_type: params.result_type }),
  });

  return http<SearchResultSchema[]>(`/api/v1/get_search_results?${queryParams}`, {
    method: 'GET',
  });
}

/**
 * Get count of search results for a user
 * @param params Query parameters
 * @returns Object with count
 */
export async function getSearchResultsCount(
  params: SearchResultsCountParams
): Promise<{ count: number }> {
  const queryParams = new URLSearchParams({
    user_id: params.user_id.toString(),
    ...(params.result_type && { result_type: params.result_type }),
  });

  return http<{ count: number }>(`/api/v1/get_search_results_count?${queryParams}`, {
    method: 'GET',
  });
}

/**
 * Get seller notifications (seller-centric view)
 * Shows times when buyers' searches matched the seller's inventory
 * @param params Query parameters
 * @returns Array of seller notifications
 */
export async function getSellerNotifications(
  params: SellerNotificationsParams
): Promise<SellerNotificationSchema[]> {
  const queryParams = new URLSearchParams({
    user_id: params.user_id.toString(),
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.offset && { offset: params.offset.toString() }),
  });

  return http<SellerNotificationSchema[]>(
    `/api/v1/seller/notifications?${queryParams}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Get count of seller notifications
 * @param userId Seller user ID
 * @returns Object with count
 */
export async function getSellerNotificationsCount(
  userId: number
): Promise<{ count: number }> {
  const queryParams = new URLSearchParams({
    user_id: userId.toString(),
  });

  return http<{ count: number }>(
    `/api/v1/seller/notifications/count?${queryParams}`,
    {
      method: 'GET',
    }
  );
}
