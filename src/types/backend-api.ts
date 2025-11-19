/**
 * Complete TypeScript types generated from FastAPI OpenAPI spec
 * These types match the backend API contract exactly
 */

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

export interface SubscriptionDetails {
  subscription_id: number;
  subscription_name: string;
  activation_date: string; // ISO 8601 datetime
  duration_days: number;
  max_diamonds_per_load: number;
  total_new_diamonds_per_period: number;
  is_active: boolean;
}

export interface BillingResponse {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  active_subscriptions: SubscriptionDetails[];
  has_active_subscription: boolean;
}

export interface UpdatePaymentMethodResponse {
  success: boolean;
  payment_url: string | null;
  message: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

export interface PaymentMethodUpdate {
  user_id: number;
  author_full_name: string;
  token_instance_value: string;
  successfull_redirect: string;
  failed_redirect: string;
}

export interface CancelSubscriptionRequest {
  user_id: number;
}

// ============================================================================
// SEARCH & NOTIFICATIONS
// ============================================================================

export interface DiamondDataSchema {
  id?: number | null;
  stock?: string | null;
  shape?: string | null;
  weight?: number | null;
  color?: string | null;
  clarity?: string | null;
  lab?: string | null;
  certificate_number?: number | null;
  price_per_carat?: number | null;
  cut?: string | null;
  polish?: string | null;
  symmetry?: string | null;
  fluorescence?: string | null;
}

export interface SearchResultSchema {
  id: number;
  seller_id: number;
  buyer_id?: number | null;
  search_query: string;
  result_type: string; // 'match' | 'unmatch'
  diamonds_data?: DiamondDataSchema[] | null;
  message_sent?: string | null;
  created_at: string; // ISO 8601 datetime
}

export interface SellerNotificationSchema {
  id: number;
  user_id: number;
  searcher_user_id?: number | null;
  search_query: string;
  result_type: string; // 'match' | 'unmatch'
  diamonds_data?: DiamondDataSchema[] | null;
  message_sent?: string | null;
  created_at: string; // ISO 8601 datetime
}

// ============================================================================
// SFTP
// ============================================================================

export interface SFTPResponseScheme {
  username: string;
  password: string;
  host_name: string;
  port_number: number;
  folder: string;
  test_result: boolean;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface DiamondReportSchema {
  total: number;
  unique_color: number;
  total_price: number;
  colors: string[];
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface InitDataRequest {
  init_data: string;
}

export interface TokenSchema {
  token: string;
  has_subscription: boolean;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiSuccessResponse<T = any> {
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    message: string;
    status: number;
    details?: any;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface SearchResultsParams {
  user_id: number;
  limit?: number; // 1-100, default 50
  offset?: number; // min 0, default 0
  result_type?: 'match' | 'unmatch' | null;
}

export interface SellerNotificationsParams {
  user_id: number;
  limit?: number; // 1-100, default 50
  offset?: number; // min 0, default 0
}

export interface SearchResultsCountParams {
  user_id: number;
  result_type?: 'match' | 'unmatch' | null;
}
