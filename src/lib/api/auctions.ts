import { http } from '@/api/http';
import { AuctionCreateRequest } from '@/types/fastapi-models';

// Re-export from fastapi-models to ensure consistency
export type { AuctionCreateRequest } from '@/types/fastapi-models';

// Matches AuctionDiamondSchema from OpenAPI spec
export interface AuctionDiamond {
  id: number;
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  lab: string;
  certificate_number: number;
  length: number;
  width: number;
  depth: number;
  ratio: number;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;
  certificate_comment: string | null;
  rapnet: number | null;
  price_per_carat: number | null;
  picture: string | null;
}

// Matches AuctionUpdateRequest from OpenAPI spec
export interface AuctionUpdateRequest {
  start_time?: string | null;
  end_time?: string | null;
  start_price?: number | null;
  current_price?: number | null;
  current_winner_id?: number | null;
  min_increment?: number | null;
  state?: 'scheduled' | 'active' | 'closed' | 'cancelled' | null;
}

// Matches BidSchema from OpenAPI spec - ALL IDs are integers
export interface BidSchema {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  created_at: string;
}

// Matches AuctionSchema from OpenAPI spec - ALL IDs are integers
export interface Auction {
  id: number;
  auction_diamond_id: number;
  start_time: string;
  end_time: string;
  start_price: number;
  current_price: number;
  current_winner_id: number | null;
  min_increment: number;
  state: 'scheduled' | 'active' | 'closed' | 'cancelled';
  auction_diamond: AuctionDiamond;
}

// Matches BidRequest from OpenAPI spec
export interface PlaceBidRequest {
  user_id: number;
  amount: number;
}

/**
 * Create a new auction via FastAPI
 * POST /api/v1/auctions/
 */
export async function createAuction(request: AuctionCreateRequest): Promise<Auction> {
  return http<Auction>('/api/v1/auctions/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get all auctions
 * GET /api/v1/auctions/
 */
export async function listAuctions(): Promise<Auction[]> {
  return http<Auction[]>('/api/v1/auctions/', {
    method: 'GET',
  });
}

/**
 * Get a single auction by ID
 * GET /api/v1/auctions/{auction_id}
 * @param auctionId - INTEGER auction ID per OpenAPI spec
 */
export async function getAuction(auctionId: number): Promise<Auction> {
  return http<Auction>(`/api/v1/auctions/${auctionId}`, {
    method: 'GET',
  });
}

/**
 * Update an auction
 * PATCH /api/v1/auctions/{auction_id}
 * @param auctionId - INTEGER auction ID per OpenAPI spec
 */
export async function updateAuction(auctionId: number, request: AuctionUpdateRequest): Promise<Auction> {
  return http<Auction>(`/api/v1/auctions/${auctionId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

/**
 * Place a bid on an auction
 * POST /api/v1/auctions/{auction_id}/bid
 * @param auctionId - INTEGER auction ID per OpenAPI spec
 */
export async function placeBid(auctionId: number, request: PlaceBidRequest): Promise<BidSchema> {
  return http<BidSchema>(`/api/v1/auctions/${auctionId}/bid`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Close an auction
 * POST /api/v1/auctions/{auction_id}/close
 * @param auctionId - INTEGER auction ID per OpenAPI spec
 */
export async function closeAuction(auctionId: number): Promise<number | null> {
  return http<number | null>(`/api/v1/auctions/${auctionId}/close`, {
    method: 'POST',
  });
}
