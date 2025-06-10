
import { useState, useMemo } from "react";
import { Diamond, StoreFilters } from "@/types/diamond";

export function useStoreFilters(diamonds: Diamond[]) {
  const getInitialRanges = () => {
    if (diamonds.length === 0) {
      return {
        caratRange: [0, 10] as [number, number],
        priceRange: [0, 100000] as [number, number]
      };
    }

    const carats = diamonds.map(d => d.carat);
    const prices = diamonds.map(d => d.price);

    return {
      caratRange: [Math.min(...carats), Math.max(...carats)] as [number, number],
      priceRange: [Math.min(...prices), Math.max(...prices)] as [number, number]
    };
  };

  const [filters, setFilters] = useState<StoreFilters>(() => ({
    shapes: [],
    colors: [],
    clarities: [],
    cuts: [],
    statuses: [],
    ...getInitialRanges()
  }));

  // Update ranges when diamonds change
  useMemo(() => {
    const ranges = getInitialRanges();
    setFilters(prev => ({
      ...prev,
      caratRange: prev.caratRange[0] === 0 && prev.caratRange[1] === 10 ? ranges.caratRange : prev.caratRange,
      priceRange: prev.priceRange[0] === 0 && prev.priceRange[1] === 100000 ? ranges.priceRange : prev.priceRange
    }));
  }, [diamonds]);

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

      // Cut filter (if specified)
      if (filters.cuts && filters.cuts.length > 0 && !filters.cuts.includes(diamond.cut)) {
        return false;
      }

      // Status filter (if specified)
      if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(diamond.status)) {
        return false;
      }

      // Carat range filter
      if (diamond.carat < filters.caratRange[0] || diamond.carat > filters.caratRange[1]) {
        return false;
      }

      // Price range filter
      if (diamond.price < filters.priceRange[0] || diamond.price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [diamonds, filters]);

  const updateFilter = (key: keyof StoreFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const ranges = getInitialRanges();
    setFilters({
      shapes: [],
      colors: [],
      clarities: [],
      cuts: [],
      statuses: [],
      ...ranges
    });
  };

  return {
    filters,
    filteredDiamonds,
    updateFilter,
    clearFilters,
  };
}
