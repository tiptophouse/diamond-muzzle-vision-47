
import { useState, useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useInventoryData } from './useInventoryData';
import { useParams } from 'react-router-dom';

export function useDiamond() {
  const { id } = useParams<{ id: string }>();
  const { allDiamonds, loading } = useInventoryData();
  const [diamond, setDiamond] = useState<Diamond | null>(null);

  useEffect(() => {
    if (id && allDiamonds.length > 0) {
      const foundDiamond = allDiamonds.find(d => d.id === id || d.stockNumber === id);
      setDiamond(foundDiamond || null);
    }
  }, [id, allDiamonds]);

  return {
    diamond,
    loading,
    error: !loading && !diamond && id ? 'Diamond not found' : null
  };
}
