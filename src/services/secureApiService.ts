
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from '@/lib/api/config';

export interface SecureApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class SecureApiService {
  private async callProxy(method: string, endpoint: string, body?: any): Promise<SecureApiResponse> {
    const telegramUserId = getCurrentUserId();
    
    if (!telegramUserId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log(`🔐 Secure API: ${method} ${endpoint} for user ${telegramUserId}`);
      
      const { data, error } = await supabase.functions.invoke('secure-fastapi-proxy', {
        body: { method, endpoint, body },
        headers: {
          'x-telegram-user-id': telegramUserId.toString()
        }
      });

      if (error) {
        console.error('🔐 Proxy error:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        console.error('🔐 FastAPI error:', data.error);
        return { success: false, error: data.error };
      }

      console.log('✅ Secure API success:', endpoint);
      return { success: true, data: data.data };
      
    } catch (error) {
      console.error('🔐 Secure API error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAllStones(): Promise<SecureApiResponse> {
    return this.callProxy('GET', '/api/v1/stones');
  }

  async addStone(stoneData: any): Promise<SecureApiResponse> {
    return this.callProxy('POST', '/api/v1/stones', stoneData);
  }

  async updateStone(stoneId: string, stoneData: any): Promise<SecureApiResponse> {
    return this.callProxy('PUT', `/api/v1/stones/${stoneId}`, stoneData);
  }

  async deleteStone(stoneId: string): Promise<SecureApiResponse> {
    return this.callProxy('DELETE', `/api/v1/stones/${stoneId}`);
  }

  async testConnection(): Promise<SecureApiResponse> {
    return this.callProxy('GET', '/api/v1/alive');
  }
}

export const secureApiService = new SecureApiService();
