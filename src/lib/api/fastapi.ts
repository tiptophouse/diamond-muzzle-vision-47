// FastAPI Client with proper error handling
import { getBackendAuthToken, getCurrentUserId } from './index';
import { toast } from 'sonner';

const API_BASE_URL = "https://api.mazalbot.com";

// FastAPI Client with proper error handling
export class FastAPIClient {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = getBackendAuthToken();
    const userId = getCurrentUserId();
    
    if (!token || !userId) {
      throw new Error('Authentication required');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get all stones for user
  async getAllStones(): Promise<any[]> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User ID required');
    
    return this.makeRequest<any[]>(`/api/v1/get_all_stones?user_id=${userId}`);
  }

  // Delete stone by ID
  async deleteStone(diamondId: number): Promise<{ success: boolean; message: string }> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User ID required');
    
    try {
      const result = await this.makeRequest<any>(
        `/api/v1/delete_stone/${diamondId}?user_id=${userId}`,
        { method: 'DELETE' }
      );
      
      toast.success('Diamond deleted successfully');
      return { success: true, message: 'Diamond deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete diamond';
      toast.error(message);
      return { success: false, message };
    }
  }

  // Create new diamond
  async createDiamond(diamondData: any): Promise<{ success: boolean; message: string }> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User ID required');
    
    try {
      const result = await this.makeRequest<any>(
        `/api/v1/diamonds?user_id=${userId}`,
        {
          method: 'POST',
          body: JSON.stringify(diamondData),
        }
      );
      
      toast.success('Diamond added successfully');
      return { success: true, message: 'Diamond added successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add diamond';
      toast.error(message);
      return { success: false, message };
    }
  }

  // Update diamond
  async updateDiamond(diamondId: number, diamondData: any): Promise<{ success: boolean; message: string }> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User ID required');
    
    try {
      const result = await this.makeRequest<any>(
        `/api/v1/diamonds/${diamondId}?user_id=${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(diamondData),
        }
      );
      
      toast.success('Diamond updated successfully');
      return { success: true, message: 'Diamond updated successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update diamond';
      toast.error(message);
      return { success: false, message };
    }
  }

  // Provision SFTP credentials
  async provisionSFTP(): Promise<{
    username: string;
    password: string;
    host_name: string;
    port_number: number;
    folder: string;
    test_result: boolean;
  }> {
    return this.makeRequest<any>('/api/v1/sftp/provision', {
      method: 'POST',
    });
  }

  // Get search results
  async getSearchResults(limit = 50, offset = 0, resultType?: string): Promise<any[]> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User ID required');
    
    let url = `/api/v1/get_search_results?user_id=${userId}&limit=${limit}&offset=${offset}`;
    if (resultType) {
      url += `&result_type=${resultType}`;
    }
    
    return this.makeRequest<any[]>(url);
  }

  // Check if API is alive
  async checkHealth(): Promise<boolean> {
    try {
      return await this.makeRequest<boolean>('/api/v1/alive');
    } catch {
      return false;
    }
  }
}

export const fastAPI = new FastAPIClient();