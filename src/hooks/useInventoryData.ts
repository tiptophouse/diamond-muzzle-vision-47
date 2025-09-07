// Inventory Data Hook - FastAPI Integration
import { useState, useEffect, useCallback } from 'react';
import { fastAPI } from '@/lib/api/fastapi';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';

export interface Diamond {
  id: number;
  diamondId?: number;
  stock: string;
  stockNumber: string;
  shape: string;
  weight: number;
  carat: number;
  color: string;
  clarity: string;
  lab?: string;
  certificate_number?: number;
  certificateNumber?: string;
  price_per_carat?: number;
  price: number;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  picture?: string;
  certificate_url?: string;
  certificateUrl?: string;
  gem360_url?: string;
  v360_url?: string;
  status?: string;
  store_visible: boolean;
}

export function useInventoryData() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useTelegramAuth();

  // Load diamonds from FastAPI
  const loadDiamonds = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setDiamonds([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fastAPI.getAllStones();
      
      // Transform API data to Diamond interface
      const transformedDiamonds: Diamond[] = data.map((item: any) => ({
        id: item.id || item.diamond_id,
        diamondId: item.id || item.diamond_id,
        stock: item.stock_number || item.stock || '',
        stockNumber: item.stock_number || item.stock || '',
        shape: item.shape || '',
        weight: parseFloat(item.weight) || 0,
        carat: parseFloat(item.weight) || 0,
        color: item.color || '',
        clarity: item.clarity || '',
        lab: item.lab,
        certificate_number: item.certificate_number,
        certificateNumber: item.certificate_number?.toString(),
        price_per_carat: item.price_per_carat,
        price: item.price_per_carat ? item.price_per_carat * parseFloat(item.weight) : 0,
        cut: item.cut,
        polish: item.polish,
        symmetry: item.symmetry,
        fluorescence: item.fluorescence,
        picture: item.picture || item.image,
        certificate_url: item.certificate_url,
        certificateUrl: item.certificate_url,
        gem360_url: item.gem360_url,
        v360_url: item.v360_url,
        status: item.status || 'Available',
        store_visible: item.store_visible !== false
      }));

      setDiamonds(transformedDiamonds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diamonds';
      setError(errorMessage);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Delete diamond with success/failure feedback
  const deleteDiamond = useCallback(async (diamondId: number): Promise<boolean> => {
    try {
      const result = await fastAPI.deleteStone(diamondId);
      
      if (result.success) {
        // Remove from local state immediately for better UX
        setDiamonds(prev => prev.filter(d => d.id !== diamondId));
        await loadDiamonds(); // Refresh to ensure consistency
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, [loadDiamonds]);

  // Add diamond with success/failure feedback
  const addDiamond = useCallback(async (diamondData: Partial<Diamond>): Promise<boolean> => {
    try {
      const result = await fastAPI.createDiamond(diamondData);
      
      if (result.success) {
        await loadDiamonds(); // Refresh inventory
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, [loadDiamonds]);

  // Update diamond
  const updateDiamond = useCallback(async (diamondId: number, diamondData: Partial<Diamond>): Promise<boolean> => {
    try {
      const result = await fastAPI.updateDiamond(diamondId, diamondData);
      
      if (result.success) {
        await loadDiamonds(); // Refresh inventory
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, [loadDiamonds]);

  // Load diamonds on mount and auth change
  useEffect(() => {
    loadDiamonds();
  }, [loadDiamonds]);

  return {
    diamonds,
    allDiamonds: diamonds, // For compatibility
    loading: isLoading,
    error,
    handleRefresh: loadDiamonds,
    fetchData: loadDiamonds,
    deleteDiamond,
    addDiamond,
    updateDiamond,
    totalDiamonds: diamonds.length,
    isEmpty: diamonds.length === 0
  };
}
