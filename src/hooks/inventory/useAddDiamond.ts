import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/api/config';
import { getAuthHeaders } from '@/lib/api/auth';

interface DiamondFormData {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  price_per_carat: number;
  lab: string;
  certificate_number: string;
  is_visible: boolean;
}

export function useAddDiamond() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDiamond = async (diamondData: DiamondFormData): Promise<{ success: boolean; data?: any; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/add_stone`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diamondData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add diamond: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // Check if result has the expected structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from server');
      }

      // Safely access the id property
      const diamondId = result.id || result.stock_number || 'unknown';
      
      console.log('✅ Diamond added successfully:', diamondId);

      toast({
        title: "יהלום נוסף בהצלחה",
        description: `היהלום ${diamondId} נוסף למלאי שלך`,
      });

      return { success: true, data: result };
    } catch (err: any) {
      console.error('❌ Error adding diamond:', err);
      setError(err.message || 'Failed to add diamond');
      toast({
        title: "שגיאה בהוספת יהלום",
        description: err.message || 'Failed to add diamond',
        variant: "destructive",
      });
      return { success: false, error: err.message || 'Failed to add diamond' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    isLoading,
    error,
  };
}
