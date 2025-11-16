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

// DELETE expects integer diamond_id from FastAPI, not stockNumber
export async function deleteDiamond(diamondId: number): Promise<DeleteDiamondResponse> {
  logger.info('Diamond delete operation started', { diamondId });
  
  try {
    const response = await http<DeleteDiamondResponse>(
      `/api/v1/delete_stone/${diamondId}`,
      { method: "DELETE" }
    );
    
    // Validate response structure
    if (!response || typeof response.success !== 'boolean') {
      throw new Error('Invalid response format from delete endpoint');
    }
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete diamond');
    }
    
    logger.info('Diamond deleted successfully', { diamondId, response });
    return response;
  } catch (error: any) {
    const errorContext = { diamondId };
    
    if (error.status === 404 || error.message?.includes('404')) {
      logger.error('Diamond not found', error, errorContext);
      throw new Error(`Diamond #${diamondId} not found`);
    }
    
    if (error.status === 422 || error.message?.includes('422')) {
      logger.error('Invalid diamond ID format', error, errorContext);
      throw new Error(`Invalid diamond ID: ${diamondId}`);
    }
    
    if (error.status === 401 || error.message?.includes('401')) {
      logger.error('Unauthorized delete attempt', error, errorContext);
      throw new Error('Authentication required to delete diamonds');
    }
    
    if (error.status === 403 || error.message?.includes('403')) {
      logger.error('Forbidden delete attempt', error, errorContext);
      throw new Error('You do not have permission to delete this diamond');
    }
    
    if (error.message?.includes('fetch') || error.name === 'TypeError') {
      logger.error('Network error during delete', error, errorContext);
      throw new Error('Network error: Unable to connect to server');
    }
    
    logger.error('Diamond delete operation failed', error, errorContext);
    throw new Error(error.message || 'Failed to delete diamond. Please try again.');
  }
}

// POST to /api/v1/diamonds - Bearer token handles auth, no user_id needed
export async function createDiamond(diamondData: any): Promise<CreateDiamondResponse> {
  logger.info('Diamond creation started', { diamondData });
  
  try {
    const response = await http<CreateDiamondResponse>(
      `/api/v1/diamonds`,
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

// PUT to /api/v1/diamonds/{diamond_id} - expects integer ID, Bearer token handles auth
export async function updateDiamond(diamondId: number, diamondData: any): Promise<CreateDiamondResponse> {
  logger.info('Diamond update started', { diamondId, diamondData });
  
  try {
    const response = await http<CreateDiamondResponse>(
      `/api/v1/diamonds/${diamondId}`,
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

// POST to /api/v1/diamonds/batch - Bearer token handles auth
export async function createDiamondsBatch(diamondsData: any[]): Promise<CreateDiamondResponse> {
  logger.info('Batch diamond creation started', { count: diamondsData.length });
  
  try {
    const response = await http<CreateDiamondResponse>(
      `/api/v1/diamonds/batch`,
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