
import { useState, useEffect, useMemo, useCallback } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

interface FilterOptions {
  shape?: string;
  color?: string;
  clarity?: string;
  caratMin?: string;
  caratMax?: string;
  [key: string]: string | undefined;
}

export function useInventorySearch(allDiamonds: Diamond[], currentPage: number = 1, filters: FilterOptions = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filteredDiamonds, setFilteredDiamonds] = useState<Diamond[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search query to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize filtering logic to prevent recalculation on every render
  const allFilteredDiamonds = useMemo(() => {
    const itemsPerPage = 10;
    let filtered = allDiamonds;

    // Apply debounced search query filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(diamond =>
        diamond.stockNumber.toLowerCase().includes(query) ||
        diamond.shape.toLowerCase().includes(query) ||
        diamond.color.toLowerCase().includes(query) ||
        diamond.clarity.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.shape && filters.shape !== "" && filters.shape !== "all") {
      filtered = filtered.filter(diamond => 
        diamond.shape === filters.shape
      );
    }

    if (filters.color && filters.color !== "" && filters.color !== "all") {
      filtered = filtered.filter(diamond => 
        diamond.color === filters.color
      );
    }

    if (filters.clarity && filters.clarity !== "" && filters.clarity !== "all") {
      filtered = filtered.filter(diamond => 
        diamond.clarity === filters.clarity
      );
    }

    if (filters.caratMin) {
      const minCarat = parseFloat(filters.caratMin);
      if (!isNaN(minCarat)) {
        filtered = filtered.filter(diamond => diamond.carat >= minCarat);
      }
    }

    if (filters.caratMax) {
      const maxCarat = parseFloat(filters.caratMax);
      if (!isNaN(maxCarat)) {
        filtered = filtered.filter(diamond => diamond.carat <= maxCarat);
      }
    }

    return filtered;
  }, [debouncedSearchQuery, allDiamonds, filters]);

  // Paginate filtered results
  const paginatedDiamonds = useMemo(() => {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFilteredDiamonds.slice(startIndex, endIndex);
  }, [allFilteredDiamonds, currentPage]);

  // Update state when results change
  useEffect(() => {
    setFilteredDiamonds(paginatedDiamonds);
    setTotalPages(Math.ceil(allFilteredDiamonds.length / 10));
  }, [paginatedDiamonds, allFilteredDiamonds]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredDiamonds,
    totalPages,
    handleSearch,
  };
}
