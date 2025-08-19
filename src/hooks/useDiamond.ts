
import { useState, useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useInventoryData } from './useInventoryData';
import { useParams } from 'react-router-dom';

export function useDiamond(diamondId?: string) {
  const { id: paramId } = useParams<{ id: string }>();
  const { allDiamonds, loading } = useInventoryData();
  const [diamond, setDiamond] = useState<Diamond | null>(null);
  
  const idToUse = diamondId || paramId;

  useEffect(() => {
    if (idToUse && allDiamonds.length > 0) {
      const foundDiamond = allDiamonds.find(d => d.id === idToUse || d.stockNumber === idToUse);
      setDiamond(foundDiamond || null);
    }
  }, [idToUse, allDiamonds]);

  return {
    data: diamond,
    isLoading: loading,
    error: !loading && !diamond && idToUse ? 'Diamond not found' : null
  };
}
