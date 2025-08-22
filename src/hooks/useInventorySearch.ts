import { useMemo } from 'react';
import { Diamond } from '@/types/diamond';

export function useInventorySearch(diamonds: Diamond[], searchTerm: string) {
  const filteredDiamonds = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return diamonds.filter(diamond => {
      const match =
        diamond.shape?.toLowerCase().includes(term) ||
        diamond.color?.toLowerCase().includes(term) ||
        diamond.clarity?.toLowerCase().includes(term) ||
        diamond.id?.toLowerCase().includes(term) ||
        diamond.diamondId?.toLowerCase().includes(term) ||
        diamond.certificateNumber?.toLowerCase().includes(term) ||
        diamond.stockNumber?.toLowerCase().includes(term) ||
        String(diamond.carat)?.includes(term) ||
        String(diamond.price)?.includes(term);

      return match;
    });
  }, [diamonds, searchTerm]);

  return { filteredDiamonds };
}
