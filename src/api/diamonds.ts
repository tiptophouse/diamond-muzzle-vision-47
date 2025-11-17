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

export async function deleteDiamond(stockNumber: string): Promise<DeleteDiamondResponse> {
  logger.info('Diamond delete operation started', { stockNumber });
  
  // Handle both numeric and alphanumeric stock numbers
  // Try to parse as integer first (FastAPI expects integer diamond_id)
  let diamondId: string;
  const parsedId = parseInt(stockNumber, 10);
  
  if (!isNaN(parsedId) && parsedId.toString() === stockNumber.trim()) {
    // Pure numeric stock number
    diamondId = parsedId.toString();
    logger.info('Using numeric diamond ID', { diamondId });
  } else {
    // Alphanumeric or non-numeric - use as-is but warn
    diamondId = stockNumber.trim();
    logger.warn('Using non-numeric stock number', { stockNumber: diamondId });
  }
  
  try {
    const response = await http<DeleteDiamondResponse>(
      apiEndpoints.deleteDiamond(diamondId), 
      { method: "DELETE" }
    );
    
    logger.info('Diamond deleted successfully', { stockNumber, diamondId, response });
    return response;
  } catch (error) {
    logger.error('Diamond delete operation failed', error, { stockNumber, diamondId });
    throw error;
  }
}

export async function createDiamond(diamondData: any): Promise<CreateDiamondResponse> {
  logger.info('Diamond creation started', { diamondData });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamond(),
      {
        method: "POST",
        body: JSON.stringify(diamondData)
      }
    );
    
    logger.info('Diamond created successfully', { diamondData, response });
    return response;
  } catch (error) {
    logger.error('Diamond creation failed', error, { diamondData });
    throw error;
  }
}

export async function updateDiamond(diamondId: string, diamondData: any): Promise<CreateDiamondResponse> {
  logger.info('Diamond update started', { diamondId, diamondData });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.updateDiamond(diamondId),
      {
        method: "PUT", 
        body: JSON.stringify(diamondData)
      }
    );
    
    logger.info('Diamond updated successfully', { diamondId, diamondData, response });
    return response;
  } catch (error) {
    logger.error('Diamond update failed', error, { diamondId, diamondData });
    throw error;
  }
}

export async function createDiamondsBatch(diamondsData: any[]): Promise<CreateDiamondResponse> {
  logger.info('Batch diamond creation started', { count: diamondsData.length });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamondsBatch(),
      {
        method: "POST",
        body: JSON.stringify({ diamonds: diamondsData })
      }
    );
    
    logger.info('Batch diamonds created successfully', { count: diamondsData.length, response });
    return response;
  } catch (error) {
    logger.error('Batch diamond creation failed', error, { count: diamondsData.length });
    throw error;
  }
}