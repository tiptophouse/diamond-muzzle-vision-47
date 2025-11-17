/**
 * React Query hooks for search results and seller notifications
 */

import { useQuery } from '@tanstack/react-query';
import type {
  SearchResultsParams,
  SellerNotificationsParams,
  SearchResultsCountParams,
} from '@/types/backend-api';
import * as searchApi from '@/lib/api/search';

// Query keys
export const searchKeys = {
  all: ['search'] as const,
  results: (params: SearchResultsParams) => [...searchKeys.all, 'results', params] as const,
  resultsCount: (params: SearchResultsCountParams) => [...searchKeys.all, 'results-count', params] as const,
  sellerNotifications: (params: SellerNotificationsParams) => [...searchKeys.all, 'seller-notifications', params] as const,
  sellerNotificationsCount: (userId: number) => [...searchKeys.all, 'seller-notifications-count', userId] as const,
};

/**
 * Get search results for a user (buyer-centric view)
 */
export function useSearchResults(params: SearchResultsParams) {
  return useQuery({
    queryKey: searchKeys.results(params),
    queryFn: () => searchApi.getSearchResults(params),
    enabled: !!params.user_id,
  });
}

/**
 * Get count of search results
 */
export function useSearchResultsCount(params: SearchResultsCountParams) {
  return useQuery({
    queryKey: searchKeys.resultsCount(params),
    queryFn: () => searchApi.getSearchResultsCount(params),
    enabled: !!params.user_id,
  });
}

/**
 * Get seller notifications (seller-centric view)
 */
export function useSellerNotifications(params: SellerNotificationsParams) {
  return useQuery({
    queryKey: searchKeys.sellerNotifications(params),
    queryFn: () => searchApi.getSellerNotifications(params),
    enabled: !!params.user_id,
  });
}

/**
 * Get count of seller notifications
 */
export function useSellerNotificationsCount(userId: number) {
  return useQuery({
    queryKey: searchKeys.sellerNotificationsCount(userId),
    queryFn: () => searchApi.getSellerNotificationsCount(userId),
    enabled: !!userId,
  });
}
