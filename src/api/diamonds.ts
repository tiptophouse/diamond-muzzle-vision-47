import { http } from "./http";
import { apiEndpoints } from "@/lib/api/endpoints";
import { logger } from '@/utils/logger';
import { 
  transformToFastAPICreate, 
  transformToFastAPIUpdate,
  FastAPIDiamondCreate,
  FastAPIDiamondUpdate 
} from './diamondTransformers';

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

export async function deleteDiamond(diamondId: number): Promise<DeleteDiamondResponse> {
  logger.info('Diamond delete operation started', { diamondId });
  
  try {
    const response = await http<DeleteDiamondResponse>(
      apiEndpoints.deleteDiamond(diamondId), 
      { method: "DELETE" }
    );
    
    logger.info('Diamond deleted successfully', { diamondId, response });
    return response;
  } catch (error) {
    logger.error('Diamond delete operation failed', error, { diamondId });
    throw error;
  }
}

export async function createDiamond(diamondData: FastAPIDiamondCreate): Promise<CreateDiamondResponse> {
  logger.info('Diamond creation started', { diamondData });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamond(),
      {
        method: "POST",
        body: JSON.stringify(diamondData)
      }
    );
    
    logger.info('Diamond created successfully', { response });
    return response;
  } catch (error) {
    logger.error('Diamond creation failed', error);
    throw error;
  }
}

export async function updateDiamond(diamondId: number, diamondData: FastAPIDiamondUpdate): Promise<CreateDiamondResponse> {
  logger.info('Diamond update started', { diamondId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.updateDiamond(diamondId),
      {
        method: "PUT", 
        body: JSON.stringify(diamondData)
      }
    );
    
    logger.info('Diamond updated successfully', { diamondId, response });
    return response;
  } catch (error) {
    logger.error('Diamond update failed', error, { diamondId });
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