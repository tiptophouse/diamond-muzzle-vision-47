
import { getCurrentUserId, getApiUrl } from '@/lib/api/config';
import { fetchApi } from '@/lib/api/client';

export interface DiamondData {
  id?: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price?: number;
  price_per_carat?: number;
  status?: string;
  store_visible?: boolean;
  picture?: string;
  certificate_number?: string;
  certificate_url?: string;
  gem360_url?: string;
  lab?: string;
  carat?: number; // For compatibility
  imageUrl?: string; // For compatibility
  stockNumber?: string; // For compatibility
}

export interface InventoryResponse {
  data?: DiamondData[];
  error?: string;
}

export async function fetchInventoryData(): Promise<InventoryResponse> {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('❌ INVENTORY: No user ID available for fetching inventory');
      return { 
        error: 'User not authenticated. Please refresh the app.',
        data: []
      };
    }

    console.log('📥 INVENTORY: Fetching inventory data from FastAPI for user:', userId);
    
    // Use your specific FastAPI endpoint format
    const endpoint = `/get_all_stones?user_id=${userId}`;
    const apiUrl = getApiUrl(endpoint);
    
    console.log('📥 INVENTORY: Making request to:', apiUrl);
    
    const result = await fetchApi<DiamondData[]>(endpoint);
    
    if (result.error) {
      console.error('❌ INVENTORY: FastAPI fetch failed:', result.error);
      return {
        error: result.error,
        data: []
      };
    }

    if (!result.data) {
      console.log('📥 INVENTORY: No data returned from FastAPI');
      return {
        data: [],
        error: null
      };
    }

    const diamonds = Array.isArray(result.data) ? result.data : [];
    console.log('✅ INVENTORY: Successfully fetched', diamonds.length, 'diamonds from FastAPI');
    
    return {
      data: diamonds,
      error: null
    };

  } catch (error) {
    console.error('❌ INVENTORY: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory';
    
    return {
      error: errorMessage,
      data: []
    };
  }
}

export async function addDiamondToInventory(diamondData: DiamondData): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        error: 'User not authenticated. Please refresh the app.' 
      };
    }

    console.log('💎 INVENTORY: Adding diamond to FastAPI for user:', userId);
    
    const endpoint = `/diamonds?user_id=${userId}`;
    const result = await fetchApi(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diamondData),
    });

    if (result.error) {
      console.error('❌ INVENTORY: Failed to add diamond:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ INVENTORY: Diamond added successfully to FastAPI');
    return { success: true };

  } catch (error) {
    console.error('❌ INVENTORY: Error adding diamond:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add diamond' 
    };
  }
}

export async function deleteDiamondFromInventory(diamondId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        error: 'User not authenticated. Please refresh the app.' 
      };
    }

    console.log('🗑️ INVENTORY: Deleting diamond from FastAPI:', diamondId, 'for user:', userId);
    
    const endpoint = `/delete_stone/${diamondId}?user_id=${userId}`;
    const result = await fetchApi(endpoint, {
      method: 'DELETE',
    });

    if (result.error) {
      console.error('❌ INVENTORY: Failed to delete diamond:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ INVENTORY: Diamond deleted successfully from FastAPI');
    return { success: true };

  } catch (error) {
    console.error('❌ INVENTORY: Error deleting diamond:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete diamond' 
    };
  }
}
