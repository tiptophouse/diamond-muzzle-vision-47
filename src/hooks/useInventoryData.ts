
import { useState, useEffect } from 'react';
import { Diamond } from '@/types/diamond';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseInventoryDataReturn {
  diamonds: Diamond[];
  allDiamonds: Diamond[];
  loading: boolean;
  error: string;
  handleRefresh: () => void;
  fetchData: () => Promise<void>;
}

export function useInventoryData(): UseInventoryDataReturn {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching inventory data for user:', userId);
      const response = await api.get<Diamond[]>(apiEndpoints.getAllStones(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      const inventoryData = response.data || [];
      console.log('✅ Inventory data fetched:', inventoryData.length, 'diamonds');
      
      setDiamonds(inventoryData);
      setAllDiamonds(inventoryData);
    } catch (err) {
      console.error('❌ Error fetching inventory:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      
      toast({
        title: "❌ Error Loading Inventory",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    diamonds,
    allDiamonds,
    loading,
    error,
    handleRefresh,
    fetchData,
  };
}
