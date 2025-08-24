
import { useState } from 'react';
import { secureApiClient } from '@/lib/api/secureClient';
import { toast } from 'sonner';

export interface DiamondDeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DiamondAddResult {
  success: boolean;
  diamond?: any;
  message?: string;
  error?: string;
}

export interface DiamondUpdateResult {
  success: boolean;
  diamond?: any;
  message?: string;
  error?: string;
}

export function useSecureDiamondOperations() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteDiamond = async (stockNumber: string): Promise<DiamondDeleteResult> => {
    if (!secureApiClient.isAuthenticated()) {
      const error = 'Authentication required to delete diamonds';
      toast.error('Authentication Error', { description: error });
      return { success: false, error };
    }

    setIsLoading(true);
    
    try {
      console.log('🗑️ Secure delete diamond:', stockNumber);
      
      const response = await secureApiClient.delete(`/api/v1/diamonds/${stockNumber}`);
      
      if (response.success) {
        toast.success('Diamond Deleted Successfully', {
          description: `Diamond ${stockNumber} has been removed from your inventory`
        });
        
        return {
          success: true,
          message: response.data?.message || 'Diamond deleted successfully'
        };
      } else {
        toast.error('Delete Failed', {
          description: response.error || 'Failed to delete diamond'
        });
        
        return {
          success: false,
          error: response.error || 'Failed to delete diamond'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('❌ Secure delete diamond error:', error);
      
      toast.error('Delete Error', {
        description: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const addDiamond = async (diamondData: any): Promise<DiamondAddResult> => {
    if (!secureApiClient.isAuthenticated()) {
      const error = 'Authentication required to add diamonds';
      toast.error('Authentication Error', { description: error });
      return { success: false, error };
    }

    setIsLoading(true);
    
    try {
      console.log('💎 Secure add new diamond:', diamondData.stock_number || diamondData.stock);
      
      const response = await secureApiClient.post('/api/v1/diamonds/', diamondData);
      
      if (response.success) {
        toast.success('Diamond Added Successfully', {
          description: `Diamond ${diamondData.stock_number || diamondData.stock} has been added to your inventory`
        });
        
        return {
          success: true,
          diamond: response.data,
          message: 'Diamond added successfully'
        };
      } else {
        toast.error('Add Failed', {
          description: response.error || 'Failed to add diamond'
        });
        
        return {
          success: false,
          error: response.error || 'Failed to add diamond'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('❌ Secure add diamond error:', error);
      
      toast.error('Add Error', {
        description: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiamond = async (diamondId: string, updateData: any): Promise<DiamondUpdateResult> => {
    if (!secureApiClient.isAuthenticated()) {
      const error = 'Authentication required to update diamonds';
      toast.error('Authentication Error', { description: error });
      return { success: false, error };
    }

    setIsLoading(true);
    
    try {
      console.log('📝 Secure update diamond:', diamondId);
      
      const response = await secureApiClient.put(`/api/v1/diamonds/${diamondId}`, updateData);
      
      if (response.success) {
        toast.success('Diamond Updated Successfully', {
          description: `Diamond ${diamondId} has been updated`
        });
        
        return {
          success: true,
          diamond: response.data,
          message: 'Diamond updated successfully'
        };
      } else {
        toast.error('Update Failed', {
          description: response.error || 'Failed to update diamond'
        });
        
        return {
          success: false,
          error: response.error || 'Failed to update diamond'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('❌ Secure update diamond error:', error);
      
      toast.error('Update Error', {
        description: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteDiamond,
    addDiamond,
    updateDiamond,
    isLoading
  };
}
