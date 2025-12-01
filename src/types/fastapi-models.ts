/**
 * TypeScript interfaces matching FastAPI Pydantic models
 * Auto-generated from OpenAPI spec
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum Shape {
  RoundBrilliant = "round brilliant",
  Princess = "princess",
  Cushion = "cushion",
  Oval = "oval",
  Emerald = "emerald",
  Pear = "pear",
  Marquise = "marquise",
  Asscher = "asscher",
  Radiant = "radiant",
  Heart = "heart",
  Baguette = "baguette",
  OldEuropean = "old european",
  Rose = "rose",
  TaperedBaguette = "tapered baguette",
  Bullet = "bullet",
  Kite = "kite",
  HalfMoons = "half moons",
  Trillion = "trillion",
  HorseHead = "horse head",
  Shield = "shield",
  Hexagonal = "hexagonal",
  OldMine = "old mine",
  RoseHead = "rose head"
}

export enum Color {
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
  M = "M",
  N = "N"
}

export enum Clarity {
  FL = "FL",
  IF = "IF",
  VVS1 = "VVS1",
  VVS2 = "VVS2",
  VS1 = "VS1",
  VS2 = "VS2",
  SI1 = "SI1",
  SI2 = "SI2",
  SI3 = "SI3",
  I1 = "I1",
  I2 = "I2",
  I3 = "I3"
}

export enum Quality {
  Excellent = "EXCELLENT",
  VeryGood = "VERY GOOD",
  Good = "GOOD",
  Poor = "POOR"
}

export enum Fluorescence {
  None = "NONE",
  Faint = "FAINT",
  Medium = "MEDIUM",
  Strong = "STRONG",
  VeryStrong = "VERY STRONG"
}

export enum Culet {
  None = "NONE",
  VerySmall = "VERY SMALL",
  Small = "SMALL",
  Medium = "MEDIUM",
  SlightlyLarge = "SLIGHTLY LARGE",
  Large = "LARGE",
  VeryLarge = "VERY LARGE",
  ExtremelyLarge = "EXTREMELY LARGE"
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
// DIAMOND MODELS
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

export interface DiamondCreateRequest {
  stock: string;
  shape: Shape;
  weight: number;
  color: Color;
  clarity: Clarity;
  certificate_number: number;
  lab?: string | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  ratio?: number | null;
  cut?: Quality | null;
  polish: Quality;
  symmetry: Quality;
  fluorescence: Fluorescence;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: Culet;
  certificate_comment?: string | null;
  rapnet?: number | null;
  price_per_carat?: number | null;
  picture?: string | null;
}

export interface DiamondUpdateRequest {
  stock?: string | null;
  shape?: Shape | null;
  weight?: number | null;
  color?: Color | null;
  clarity?: Clarity | null;
  lab?: string | null;
  certificate_number?: number | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  ratio?: number | null;
  cut?: Quality | null;
  polish?: Quality | null;
  symmetry?: Quality | null;
  fluorescence?: Fluorescence | null;
  table?: number | null;
  depth_percentage?: number | null;
  gridle?: string | null;
  culet?: Culet | null;
  certificate_comment?: string | null;
  rapnet?: number | null;
  price_per_carat?: number | null;
  picture?: string | null;
}

export interface DiamondBatchCreateRequest {
  diamonds: DiamondCreateRequest[];
}

export interface DiamondReportSchema {
  total: number;
  unique_color: number;
  total_price: number;
  colors: string[];
}

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

export interface SubscriptionDetails {
  subscription_id: number;
  subscription_name: string;
  activation_date: string;
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

// ============================================================================
// NOTIFICATIONS & SEARCH RESULTS
// ============================================================================

export interface SearchResultSchema {
  id: number;
  seller_id: number;
  buyer_id?: number | null;
  search_query: string;
  result_type: string;
  diamonds_data?: DiamondDataSchema[] | null;
  message_sent?: string | null;
  created_at: string;
}

export interface SellerNotificationSchema {
  id: number;
  user_id: number;
  searcher_user_id?: number | null;
  search_query: string;
  result_type: string;
  diamonds_data?: DiamondDataSchema[] | null;
  message_sent?: string | null;
  created_at: string;
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
// VALIDATION
// ============================================================================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// Auction Types
export interface AuctionSchema {
  id: string;
  stock_number: string;
  seller_telegram_id: number;
  starting_price: number;
  current_price: number;
  min_increment: number;
  currency: string;
  status: 'active' | 'ended' | 'cancelled' | 'sold';
  starts_at: string;
  ends_at: string;
  winner_telegram_id?: number;
  created_at: string;
  updated_at: string;
  
  // Joined data
  diamond?: DiamondDataSchema;
  bid_count?: number;
  latest_bids?: AuctionBidSchema[];
}

export interface AuctionBidSchema {
  id: string;
  auction_id: string;
  bidder_telegram_id: number;
  bidder_name?: string;
  bid_amount: number;
  created_at: string;
}

export interface AuctionCreateRequest {
  stock_number: string;
  starting_price: number;
  min_increment: number;
  duration_hours: number;
  currency?: string;
}

export interface PlaceBidRequest {
  bid_amount?: number;
}

export interface AuctionDetailResponse extends AuctionSchema {
  diamond: DiamondDataSchema;
  bids: AuctionBidSchema[];
  bid_count: number;
  time_remaining_seconds: number;
  is_seller: boolean;
  user_highest_bid?: AuctionBidSchema;
}
