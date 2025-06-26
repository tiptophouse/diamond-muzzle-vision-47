import { TelegramAuthService } from './telegramAuthService';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from '@/lib/api/config';

export interface DiamondData {
  id?: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat?: number;
  price?: number;
  status?: string;
  store_visible?: boolean;
  picture?: string;
  certificate_url?: string;
  certificate_number?: string;
  lab?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
}

export class HybridDiamondService {
  private authService = TelegramAuthService.getInstance();

  async fetchDiamonds(): Promise<DiamondData[]> {
    console.log('💎 HYBRID SERVICE: Fetching diamonds...');
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Try secure FastAPI proxy first
    try {
      const result = await this.trySecureFastAPIFetch();
      if (result && result.length >= 0) {
        console.log('✅ HYBRID SERVICE: Secure FastAPI fetch successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: Secure FastAPI failed, trying Supabase...', error);
    }

    // Fallback to Supabase
    return this.trySupabaseFetch();
  }

  async addDiamond(data: DiamondData): Promise<boolean> {
    console.log('💎 HYBRID SERVICE: Adding diamond...');
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Try secure FastAPI proxy first
    try {
      const result = await this.trySecureFastAPIAdd(data);
      if (result) {
        console.log('✅ HYBRID SERVICE: Secure FastAPI add successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: Secure FastAPI add failed, trying Supabase...', error);
    }

    // Fallback to Supabase
    return this.trySupabaseAdd(data);
  }

  async updateDiamond(diamondId: string, data: DiamondData): Promise<boolean> {
    console.log('💎 HYBRID SERVICE: Updating diamond:', diamondId);
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Try secure FastAPI proxy first
    try {
      const result = await this.trySecureFastAPIUpdate(diamondId, data);
      if (result) {
        console.log('✅ HYBRID SERVICE: Secure FastAPI update successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: Secure FastAPI update failed, trying Supabase...', error);
    }

    // Fallback to Supabase
    return this.trySupabaseUpdate(diamondId, data);
  }

  async deleteDiamond(diamondId: string): Promise<boolean> {
    console.log('💎 HYBRID SERVICE: Deleting diamond:', diamondId);
    
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Try secure FastAPI proxy first
    try {
      const result = await this.trySecureFastAPIDelete(diamondId);
      if (result) {
        console.log('✅ HYBRID SERVICE: Secure FastAPI delete successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: Secure FastAPI delete failed, trying Supabase...', error);
    }

    // Fallback to Supabase
    return this.trySupabaseDelete(diamondId);
  }

  private async trySecureFastAPIFetch(): Promise<DiamondData[]> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('secure-fastapi-proxy', {
      body: {
        method: 'GET',
        endpoint: '/api/v1/get_all_stones',
        telegramUserId: userId
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data?.success) {
      throw new Error(response.data?.error || 'FastAPI request failed');
    }

    const result = response.data.data;
    return Array.isArray(result) ? result : (result.stones || result.data || []);
  }

  private async trySecureFastAPIAdd(data: DiamondData): Promise<boolean> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('secure-fastapi-proxy', {
      body: {
        method: 'POST',
        endpoint: '/api/v1/diamonds',
        telegramUserId: userId,
        data: {
          shape: data.shape,
          weight: data.weight,
          color: data.color,
          clarity: data.clarity,
          cut: data.cut,
          price: data.price || 0,
          polish: data.polish,
          symmetry: data.symmetry,
          fluorescence: data.fluorescence,
          stock_number: data.stock_number
        }
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.success || false;
  }

  private async trySecureFastAPIUpdate(diamondId: string, data: DiamondData): Promise<boolean> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('secure-fastapi-proxy', {
      body: {
        method: 'PUT',
        endpoint: `/api/v1/diamonds/${diamondId}`,
        telegramUserId: userId,
        data
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.success || false;
  }

  private async trySecureFastAPIDelete(diamondId: string): Promise<boolean> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('secure-fastapi-proxy', {
      body: {
        method: 'DELETE',
        endpoint: `/api/v1/delete_stone/${diamondId}`,
        telegramUserId: userId
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.success || false;
  }

  private async trySupabaseFetch(): Promise<DiamondData[]> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('diamond-operations', {
      body: {
        operation: 'fetch',
        telegramUserId: userId
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.data || [];
  }

  private async trySupabaseAdd(data: DiamondData): Promise<boolean> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('diamond-operations', {
      body: {
        operation: 'add',
        telegramUserId: userId,
        data
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.success || false;
  }

  private async trySupabaseUpdate(diamondId: string, data: DiamondData): Promise<boolean> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('diamond-operations', {
      body: {
        operation: 'update',
        telegramUserId: userId,
        diamondId,
        data
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.success || false;
  }

  private async trySupabaseDelete(diamondId: string): Promise<boolean> {
    const userId = getCurrentUserId();
    
    const response = await supabase.functions.invoke('diamond-operations', {
      body: {
        operation: 'delete',
        telegramUserId: userId,
        diamondId
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data?.success || false;
  }
}
