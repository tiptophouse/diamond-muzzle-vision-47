
import { useMemo, useState, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

export interface StoreFilters {
  shapes: string[];
  colors: string[];
  clarities: string[];
  cuts: string[];
  fluorescence: string[];
  priceRange: [number, number];
  caratRange: [number, number];
}

export function useStoreFilters(diamonds: Diamond[]) {
  const [filters, setFilters] = useState<StoreFilters>({
    shapes: [],
    colors: [],
    clarities: [],
    cuts: [],
    fluorescence: [],
    priceRange: [0, 100000],
    caratRange: [0, 10],
  });

  const filteredDiamonds = useMemo(() => {
    return diamonds.filter(diamond => {
      // Shape filter
      if (filters.shapes.length > 0 && !filters.shapes.includes(diamond.shape)) {
        return false;
      }

      // Color filter
      if (filters.colors.length > 0 && !filters.colors.includes(diamond.color)) {
        return false;
      }

      // Clarity filter
      if (filters.clarities.length > 0 && !filters.clarities.includes(diamond.clarity)) {
        return false;
      }

      // Cut filter
      if (filters.cuts.length > 0 && !filters.cuts.includes(diamond.cut)) {
        return false;
      }

      // Fluorescence filter
      if (filters.fluorescence.length > 0) {
        const fluorescence = diamond.fluorescence || 'None';
        if (!filters.fluorescence.includes(fluorescence)) {
          return false;
        }
      }

      // Price filter
      if (diamond.price < filters.priceRange[0] || diamond.price > filters.priceRange[1]) {
        return false;
      }

      // Carat filter
      if (diamond.carat < filters.caratRange[0] || diamond.carat > filters.caratRange[1]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Always prioritize diamonds with images first
      const aHasImage = !!(a.imageUrl && a.imageUrl.trim());
      const bHasImage = !!(b.imageUrl && b.imageUrl.trim());
      
      if (aHasImage && !bHasImage) return -1;
      if (!aHasImage && bHasImage) return 1;
      
      // If both have images or both don't have images, maintain original order
      return 0;
    });
  }, [diamonds, filters]);

  const updateFilter = useCallback(<K extends keyof StoreFilters>(
    key: K,
    value: StoreFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      shapes: [],
      colors: [],
      clarities: [],
      cuts: [],
      fluorescence: [],
      priceRange: [0, 100000],
      caratRange: [0, 10],
    });
  }, []);

  return {
    filters,
    filteredDiamonds,
    updateFilter,
    clearFilters,
  };
}
