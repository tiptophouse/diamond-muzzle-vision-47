
import { useState, useMemo } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

export interface StoreFilters {
  searchQuery: string;
  shape: string;
  colorFrom: string;
  colorTo: string;
  clarityFrom: string;
  clarityTo: string;
  caratFrom: number | null;
  caratTo: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  cut: string;
  lab: string;
  fluorescence: string;
  status: string;
}

export function useStoreFilters(diamonds: Diamond[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StoreFilters>({
    searchQuery: "",
    shape: "",
    colorFrom: "",
    colorTo: "",
    clarityFrom: "",
    clarityTo: "",
    caratFrom: null,
    caratTo: null,
    priceFrom: null,
    priceTo: null,
    cut: "",
    lab: "",
    fluorescence: "",
    status: "",
  });

  const filteredDiamonds = useMemo(() => {
    return diamonds.filter(diamond => {
      // Search query filter
      if (searchQuery && !diamond.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !diamond.shape.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !diamond.color.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !diamond.clarity.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Shape filter
      if (filters.shape && diamond.shape !== filters.shape) return false;

      // Color range filter
      if (filters.colorFrom || filters.colorTo) {
        const colorOrder = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
        const diamondColorIndex = colorOrder.indexOf(diamond.color);
        const fromIndex = filters.colorFrom ? colorOrder.indexOf(filters.colorFrom) : 0;
        const toIndex = filters.colorTo ? colorOrder.indexOf(filters.colorTo) : colorOrder.length - 1;
        
        if (diamondColorIndex < fromIndex || diamondColorIndex > toIndex) return false;
      }

      // Clarity range filter
      if (filters.clarityFrom || filters.clarityTo) {
        const clarityOrder = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
        const diamondClarityIndex = clarityOrder.indexOf(diamond.clarity);
        const fromIndex = filters.clarityFrom ? clarityOrder.indexOf(filters.clarityFrom) : 0;
        const toIndex = filters.clarityTo ? clarityOrder.indexOf(filters.clarityTo) : clarityOrder.length - 1;
        
        if (diamondClarityIndex < fromIndex || diamondClarityIndex > toIndex) return false;
      }

      // Carat range filter
      if (filters.caratFrom !== null && diamond.carat < filters.caratFrom) return false;
      if (filters.caratTo !== null && diamond.carat > filters.caratTo) return false;

      // Price range filter
      if (filters.priceFrom !== null && diamond.price < filters.priceFrom) return false;
      if (filters.priceTo !== null && diamond.price > filters.priceTo) return false;

      // Cut filter
      if (filters.cut && diamond.cut !== filters.cut) return false;

      // Lab filter
      if (filters.lab && diamond.lab !== filters.lab) return false;

      // Fluorescence filter
      if (filters.fluorescence && diamond.fluorescence !== filters.fluorescence) return false;

      // Status filter
      if (filters.status && diamond.status !== filters.status) return false;

      return true;
    });
  }, [diamonds, searchQuery, filters]);

  const updateFilter = (key: keyof StoreFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterChange = (key: keyof StoreFilters, value: any) => {
    updateFilter(key, value);
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      shape: "",
      colorFrom: "",
      colorTo: "",
      clarityFrom: "",
      clarityTo: "",
      caratFrom: null,
      caratTo: null,
      priceFrom: null,
      priceTo: null,
      cut: "",
      lab: "",
      fluorescence: "",
      status: "",
    });
    setSearchQuery("");
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return false;
    return value !== "" && value !== null;
  }).length;

  return {
    filters,
    filteredDiamonds,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    updateFilter,
    handleFilterChange,
    clearFilters,
    activeFilters,
  };
}
