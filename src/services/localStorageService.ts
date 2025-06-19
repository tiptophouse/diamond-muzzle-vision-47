
import { getCurrentUserId } from '@/lib/api/config';

export interface LocalDiamond {
  id: string;
  user_id: number;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  price_per_carat?: number;
  status: string;
  store_visible: boolean;
  picture?: string;
  certificate_number?: string;
  certificate_url?: string;
  lab?: string;
  created_at: string;
  updated_at?: string;
}

export interface LocalStorageResult {
  data?: LocalDiamond[];
  error?: string;
  success: boolean;
}

const STORAGE_KEY = 'diamond_inventory';

export class LocalStorageService {
  static getAllDiamonds(): LocalStorageResult {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated', data: [] };
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { success: true, data: [] };
      }

      const allDiamonds: LocalDiamond[] = JSON.parse(data);
      const userDiamonds = allDiamonds.filter(diamond => diamond.user_id === userId);
      
      console.log('📦 Local Storage: Retrieved', userDiamonds.length, 'diamonds for user', userId);
      return { success: true, data: userDiamonds };
    } catch (error) {
      console.error('❌ Local Storage: Error retrieving diamonds:', error);
      return { success: false, error: 'Failed to retrieve diamonds from storage', data: [] };
    }
  }

  static addDiamond(diamond: Omit<LocalDiamond, 'created_at' | 'id'>): LocalStorageResult {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newDiamond: LocalDiamond = {
        ...diamond,
        id: `diamond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        created_at: new Date().toISOString(),
      };

      existingData.push(newDiamond);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      console.log('➕ Local Storage: Added diamond:', newDiamond.stock_number);
      return { success: true, data: [newDiamond] };
    } catch (error) {
      console.error('❌ Local Storage: Error adding diamond:', error);
      return { success: false, error: 'Failed to add diamond to storage' };
    }
  }

  static updateDiamond(diamondId: string, updates: Partial<LocalDiamond>): LocalStorageResult {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const diamondIndex = existingData.findIndex((d: LocalDiamond) => 
        d.id === diamondId && d.user_id === userId
      );

      if (diamondIndex === -1) {
        return { success: false, error: 'Diamond not found' };
      }

      existingData[diamondIndex] = {
        ...existingData[diamondIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      console.log('📝 Local Storage: Updated diamond:', diamondId);
      return { success: true, data: [existingData[diamondIndex]] };
    } catch (error) {
      console.error('❌ Local Storage: Error updating diamond:', error);
      return { success: false, error: 'Failed to update diamond in storage' };
    }
  }

  static deleteDiamond(diamondId: string): LocalStorageResult {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filteredData = existingData.filter((d: LocalDiamond) => 
        !(d.id === diamondId && d.user_id === userId)
      );

      if (filteredData.length === existingData.length) {
        return { success: false, error: 'Diamond not found' };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      
      console.log('🗑️ Local Storage: Deleted diamond:', diamondId);
      return { success: true };
    } catch (error) {
      console.error('❌ Local Storage: Error deleting diamond:', error);
      return { success: false, error: 'Failed to delete diamond from storage' };
    }
  }

  static bulkAddDiamonds(diamonds: Omit<LocalDiamond, 'created_at' | 'id' | 'user_id'>[]): LocalStorageResult {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newDiamonds: LocalDiamond[] = diamonds.map((diamond, index) => ({
        ...diamond,
        id: `bulk_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));

      const updatedData = [...existingData, ...newDiamonds];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      console.log('📦 Local Storage: Bulk added', newDiamonds.length, 'diamonds');
      return { success: true, data: newDiamonds };
    } catch (error) {
      console.error('❌ Local Storage: Error bulk adding diamonds:', error);
      return { success: false, error: 'Failed to bulk add diamonds to storage' };
    }
  }

  static exportToCSV(): string {
    const result = this.getAllDiamonds();
    if (!result.success || !result.data) {
      throw new Error('Failed to export data');
    }

    const headers = [
      'Stock Number', 'Shape', 'Carat', 'Color', 'Clarity', 'Cut', 
      'Price', 'Status', 'Store Visible', 'Certificate Number', 'Lab'
    ];

    const csvContent = [
      headers.join(','),
      ...result.data.map(diamond => [
        diamond.stock_number,
        diamond.shape,
        diamond.weight,
        diamond.color,
        diamond.clarity,
        diamond.cut,
        diamond.price,
        diamond.status,
        diamond.store_visible,
        diamond.certificate_number || '',
        diamond.lab || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  static clearAllData(): LocalStorageResult {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filteredData = existingData.filter((d: LocalDiamond) => d.user_id !== userId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      
      console.log('🧹 Local Storage: Cleared all data for user', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Local Storage: Error clearing data:', error);
      return { success: false, error: 'Failed to clear data from storage' };
    }
  }
}
