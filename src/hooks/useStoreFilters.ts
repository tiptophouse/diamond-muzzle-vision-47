
import { useState, useMemo } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

interface StoreFilters {
  shapes: string[];
  colors: string[];
  clarities: string[];
  cuts: string[];
  fluorescence: string[];
  polish: string[];
  symmetry: string[];
  caratRange: [number, number];
  priceRange: [number, number];
  depthRange: [number, number];
  tableRange: [number, number];
  hasImages: boolean;
  has360: boolean;
}

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
    fluorescence: [],
    polish: [],
    symmetry: [],
    hasImages: false,
    has360: false,
    ...getInitialRanges(),
    depthRange: [50, 80] as [number, number],
    tableRange: [45, 75] as [number, number]
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
      // Image availability filter
      if (filters.hasImages) {
        const hasValidImage = diamond.imageUrl && 
                            diamond.imageUrl !== 'default' && 
                            diamond.imageUrl.trim() !== '' &&
                            diamond.imageUrl.startsWith('http');
        if (!hasValidImage) {
          return false;
        }
      }

      // 360° availability filter
      if (filters.has360) {
        const hasValid360 = diamond.gem360Url && 
                          diamond.gem360Url.trim() !== '' &&
                          diamond.gem360Url.includes('.html');
        if (!hasValid360) {
          return false;
        }
      }

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

      // Fluorescence filter - need to handle undefined/null values
      if (filters.fluorescence.length > 0) {
        const diamondFluorescence = diamond.fluorescence || 'None';
        if (!filters.fluorescence.includes(diamondFluorescence)) {
          return false;
        }
      }

      // Polish filter (placeholder - not in current Diamond type)
      if (filters.polish.length > 0) {
        // For now, all diamonds pass this filter since we don't have polish data
        // In future, would check: filters.polish.includes(diamond.polish || 'N/A')
      }

      // Symmetry filter (placeholder - not in current Diamond type)
      if (filters.symmetry.length > 0) {
        // For now, all diamonds pass this filter since we don't have symmetry data
        // In future, would check: filters.symmetry.includes(diamond.symmetry || 'N/A')
      }

      // Depth range filter (placeholder - not in current Diamond type)
      // For now, all diamonds pass this filter

      // Table range filter (placeholder - not in current Diamond type)
      // For now, all diamonds pass this filter

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
      fluorescence: [],
      polish: [],
      symmetry: [],
      hasImages: false,
      has360: false,
      depthRange: [50, 80] as [number, number],
      tableRange: [45, 75] as [number, number],
      ...ranges
    });
  };

  // Calculate image statistics
  const imageStats = useMemo(() => {
    const withImages = diamonds.filter(d => 
      d.imageUrl && 
      d.imageUrl !== 'default' && 
      d.imageUrl.trim() !== '' &&
      d.imageUrl.startsWith('http')
    ).length;
    
    const with360 = diamonds.filter(d => 
      d.gem360Url && 
      d.gem360Url.trim() !== '' &&
      d.gem360Url.includes('.html')
    ).length;

    return {
      withImages,
      with360,
      total: diamonds.length,
      withoutImages: diamonds.length - withImages,
      without360: diamonds.length - with360
    };
  }, [diamonds]);

  return {
    filters,
    filteredDiamonds,
    updateFilter,
    clearFilters,
    imageStats,
  };
}
