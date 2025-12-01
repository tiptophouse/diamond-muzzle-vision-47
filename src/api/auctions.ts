import { http } from "./http";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { 
  FastAPIAuctionSchema, 
  FastAPIAuctionCreateRequest,
  FastAPIBidRequest,
  FastAPIBidSchema 
} from "@/types/fastapi-models";

export async function listAuctions(): Promise<FastAPIAuctionSchema[]> {
  return http<FastAPIAuctionSchema[]>(apiEndpoints.auctions.list(), { method: "GET" });
}

export async function getAuction(auctionId: number): Promise<FastAPIAuctionSchema> {
  return http<FastAPIAuctionSchema>(apiEndpoints.auctions.getById(auctionId), { method: "GET" });
}

export async function createAuction(data: FastAPIAuctionCreateRequest): Promise<FastAPIAuctionSchema> {
  return http<FastAPIAuctionSchema>(apiEndpoints.auctions.create(), {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function placeBid(auctionId: number, data: FastAPIBidRequest): Promise<FastAPIBidSchema> {
  return http<FastAPIBidSchema>(apiEndpoints.auctions.placeBid(auctionId), {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function closeAuction(auctionId: number): Promise<number | null> {
  return http<number | null>(apiEndpoints.auctions.close(auctionId), { method: "POST" });
}
