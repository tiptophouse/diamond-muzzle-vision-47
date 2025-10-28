import { http } from "./http";
import { apiEndpoints } from "@/lib/api/endpoints";
import { logger } from '@/utils/logger';

export interface DeleteDiamondResponse {
  success: boolean;
  message: string;
  deleted_count?: number;
}

export interface CreateDiamondResponse {
  success: boolean;
  message: string;
  diamond_id?: string;
}

export async function deleteDiamond(stockNumber: string, userId: number): Promise<DeleteDiamondResponse> {
  logger.info('Diamond delete operation started', { stockNumber, userId });
  
  try {
    const response = await http<DeleteDiamondResponse>(
      apiEndpoints.deleteDiamond(stockNumber, userId), 
      { method: "DELETE" }
    );
    
    logger.info('Diamond deleted successfully', { stockNumber, response });
    return response;
  } catch (error) {
    logger.error('Diamond delete operation failed', error, { stockNumber, userId });
    throw error;
  }
}

export async function createDiamond(diamondData: any, userId: number): Promise<CreateDiamondResponse> {
  logger.info('Diamond creation started', { diamondData, userId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamond(userId),
      {
        method: "POST",
        body: JSON.stringify(diamondData)
      }
    );
    
    logger.info('Diamond created successfully', { diamondData, response });
    return response;
  } catch (error) {
    logger.error('Diamond creation failed', error, { diamondData, userId });
    throw error;
  }
}

export async function updateDiamond(diamondId: string, diamondData: any, userId: number): Promise<CreateDiamondResponse> {
  logger.info('Diamond update started', { diamondId, diamondData, userId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.updateDiamond(diamondId, userId),
      {
        method: "PUT", 
        body: JSON.stringify(diamondData)
      }
    );
    
    logger.info('Diamond updated successfully', { diamondId, diamondData, response });
    return response;
  } catch (error) {
    logger.error('Diamond update failed', error, { diamondId, diamondData, userId });
    throw error;
  }
}

export async function createDiamondsBatch(diamondsData: any[], userId: number): Promise<CreateDiamondResponse> {
  logger.info('Batch diamond creation started', { count: diamondsData.length, userId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamondsBatch(userId),
      {
        method: "POST",
        body: JSON.stringify({ diamonds: diamondsData })
      }
    );
    
    logger.info('Batch diamonds created successfully', { count: diamondsData.length, response });
    return response;
  } catch (error) {
    logger.error('Batch diamond creation failed', error, { count: diamondsData.length, userId });
    throw error;
  }
}