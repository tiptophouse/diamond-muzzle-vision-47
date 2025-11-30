import { N8NResponse } from './n8n';

export interface AuctionCreateRequest {
  stockNumber: string;
  startingPrice: number;
  minIncrement: number;
  currency: string;
  durationMinutes: number;
  reservePrice?: number;
  sellerTelegramId: number;
  diamondData: {
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cut?: string;
    picture?: string;
    certificateUrl?: string;
    pricePerCarat?: number;
  };
  groupChatIds: number[]; // Telegram group IDs to broadcast to
}

export interface BidRequest {
  auctionId: string;
  bidderTelegramId: number;
  bidderName: string;
  bidAmount: number;
}

// N8N webhook URLs
const N8N_AUCTION_CREATE_URL = 'https://n8nlo.app.n8n.cloud/webhook/auction-create';
const N8N_AUCTION_BID_URL = 'https://n8nlo.app.n8n.cloud/webhook/auction-bid';

/**
 * Call n8n Auction Create Engine
 * Creates auction in Supabase and broadcasts to Telegram groups
 */
export async function createAuction(request: AuctionCreateRequest): Promise<N8NResponse> {
  try {
    console.log('🎯 Creating auction via n8n:', request);

    const response = await fetch(N8N_AUCTION_CREATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Auction creation failed:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Auction created:', data);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Auction creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create auction',
    };
  }
}

/**
 * Call n8n Bid Processor Engine
 * Processes bid, updates Supabase, and updates all Telegram messages
 */
export async function placeBid(request: BidRequest): Promise<N8NResponse> {
  try {
    console.log('💎 Placing bid via n8n:', request);

    const response = await fetch(N8N_AUCTION_BID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Bid placement failed:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Bid placed:', data);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Bid placement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place bid',
    };
  }
}
