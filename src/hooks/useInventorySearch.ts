
import { useState, useEffect, useMemo } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

interface FilterOptions {
  shape?: string;
  color?: string;
  clarity?: string;
  caratMin?: string;
  caratMax?: string;
  [key: string]: string | undefined;
}

export function useInventorySearch(allDiamonds: Diamond[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>('stockNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  const filteredDiamonds = useMemo(() => {
    let filtered = allDiamonds;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(diamond =>
        diamond.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.clarity.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Diamond];
      let bValue = b[sortBy as keyof Diamond];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [allDiamonds, searchTerm, filters, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredDiamonds.length / itemsPerPage);
  
  const paginatedDiamonds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDiamonds.slice(startIndex, endIndex);
  }, [filteredDiamonds, currentPage]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredDiamonds,
    sortBy,
    sortOrder,
    handleSort,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedDiamonds
  };
}
