import { http } from '@/api/http';

// Types matching FastAPI OpenAPI contract
export interface CreateAuctionRequest {
  diamond_id: number;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  start_price: number;
  min_increment: number;
}

export interface AuctionDiamond {
  id: number;
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  lab: string;
  certificate_number: number;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  price_per_carat: number | null;
  picture: string | null;
}

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

export interface PlaceBidRequest {
  user_id: number;
  amount: number;
}

/**
 * Create a new auction via FastAPI
 */
export async function createAuction(request: CreateAuctionRequest): Promise<Auction> {
  return http<Auction>('/api/v1/auctions/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get all auctions
 */
export async function listAuctions(): Promise<Auction[]> {
  return http<Auction[]>('/api/v1/auctions/', {
    method: 'GET',
  });
}

/**
 * Get a single auction by ID
 */
export async function getAuction(auctionId: number): Promise<Auction> {
  return http<Auction>(`/api/v1/auctions/${auctionId}`, {
    method: 'GET',
  });
}

/**
 * Place a bid on an auction
 */
export async function placeBid(auctionId: number, request: PlaceBidRequest) {
  return http(`/api/v1/auctions/${auctionId}/bid`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Close an auction
 */
export async function closeAuction(auctionId: number) {
  return http(`/api/v1/auctions/${auctionId}/close`, {
    method: 'POST',
  });
}
