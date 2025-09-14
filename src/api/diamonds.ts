import { http } from "./http";
import { apiEndpoints } from "@/lib/api/endpoints";

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
  console.log('🗑️ API: Calling delete diamond endpoint:', { stockNumber, userId });
  
  try {
    const response = await http<DeleteDiamondResponse>(
      apiEndpoints.deleteDiamond(stockNumber, userId), 
      { method: "DELETE" }
    );
    
    console.log('✅ API: Delete response:', response);
    return response;
  } catch (error) {
    console.error('❌ API: Delete diamond failed:', error);
    throw error;
  }
}

export async function createDiamond(diamondData: any, userId: number): Promise<CreateDiamondResponse> {
  console.log('➕ API: Creating diamond:', { diamondData, userId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamond(userId),
      {
        method: "POST",
        body: JSON.stringify(diamondData)
      }
    );
    
    console.log('✅ API: Create response:', response);
    return response;
  } catch (error) {
    console.error('❌ API: Create diamond failed:', error);
    throw error;
  }
}

export async function updateDiamond(diamondId: string, diamondData: any, userId: number): Promise<CreateDiamondResponse> {
  console.log('✏️ API: Updating diamond:', { diamondId, diamondData, userId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.updateDiamond(diamondId, userId),
      {
        method: "PUT", 
        body: JSON.stringify(diamondData)
      }
    );
    
    console.log('✅ API: Update response:', response);
    return response;
  } catch (error) {
    console.error('❌ API: Update diamond failed:', error);
    throw error;
  }
}

export async function createDiamondsBatch(diamondsData: any[], userId: number): Promise<CreateDiamondResponse> {
  console.log('📦 API: Creating diamonds batch:', { count: diamondsData.length, userId });
  
  try {
    const response = await http<CreateDiamondResponse>(
      apiEndpoints.addDiamondsBatch(userId),
      {
        method: "POST",
        body: JSON.stringify({ diamonds: diamondsData })
      }
    );
    
    console.log('✅ API: Batch create response:', response);
    return response;
  } catch (error) {
    console.error('❌ API: Batch create diamonds failed:', error);
    throw error;
  }
}