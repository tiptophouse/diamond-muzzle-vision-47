
import { TelegramAuthService } from './telegramAuthService';
import { supabase } from '@/integrations/supabase/client';
import { getAccessToken, getCurrentUserId } from '@/lib/api/config';

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

    // Try FastAPI first
    try {
      const result = await this.tryFastAPIFetch();
      if (result && result.length >= 0) {
        console.log('✅ HYBRID SERVICE: FastAPI fetch successful');
        return result;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: FastAPI failed, trying Supabase...', error);
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

    // Try FastAPI first
    try {
      const result = await this.tryFastAPIAdd(data);
      if (result) {
        console.log('✅ HYBRID SERVICE: FastAPI add successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: FastAPI add failed, trying Supabase...', error);
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

    // Try FastAPI first
    try {
      const result = await this.tryFastAPIUpdate(diamondId, data);
      if (result) {
        console.log('✅ HYBRID SERVICE: FastAPI update successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: FastAPI update failed, trying Supabase...', error);
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

    // Try FastAPI first
    try {
      const result = await this.tryFastAPIDelete(diamondId);
      if (result) {
        console.log('✅ HYBRID SERVICE: FastAPI delete successful');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ HYBRID SERVICE: FastAPI delete failed, trying Supabase...', error);
    }

    // Fallback to Supabase
    return this.trySupabaseDelete(diamondId);
  }

  private async tryFastAPIFetch(): Promise<DiamondData[]> {
    const accessToken = getAccessToken();
    const userId = getCurrentUserId();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch('https://api.mazalbot.com/api/v1/get_all_stones', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': userId?.toString() || ''
      }
    });

    if (!response.ok) {
      throw new Error(`FastAPI fetch failed: ${response.status}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : (result.stones || result.data || []);
  }

  private async tryFastAPIAdd(data: DiamondData): Promise<boolean> {
    const accessToken = getAccessToken();
    const userId = getCurrentUserId();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch('https://api.mazalbot.com/api/v1/diamonds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': userId?.toString() || ''
      },
      body: JSON.stringify({
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
      })
    });

    return response.ok;
  }

  private async tryFastAPIUpdate(diamondId: string, data: DiamondData): Promise<boolean> {
    const accessToken = getAccessToken();
    const userId = getCurrentUserId();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.mazalbot.com/api/v1/diamonds/${diamondId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': userId?.toString() || ''
      },
      body: JSON.stringify(data)
    });

    return response.ok;
  }

  private async tryFastAPIDelete(diamondId: string): Promise<boolean> {
    const accessToken = getAccessToken();
    const userId = getCurrentUserId();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.mazalbot.com/api/v1/delete_stone/${diamondId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': userId?.toString() || ''
      }
    });

    return response.ok;
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
