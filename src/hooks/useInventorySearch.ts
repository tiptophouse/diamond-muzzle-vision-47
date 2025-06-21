
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

interface FilterOptions {
  shape?: string;
  color?: string;
  clarity?: string;
  caratMin?: string;
  caratMax?: string;
}

export function useInventorySearch(allDiamonds: Diamond[], currentPage: number, filters: FilterOptions = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDiamonds, setFilteredDiamonds] = useState<Diamond[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const itemsPerPage = 10;
    let filtered = allDiamonds;

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(diamond =>
        diamond.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.clarity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.shape && filters.shape !== "all") {
      filtered = filtered.filter(diamond => 
        diamond.shape.toLowerCase() === filters.shape?.toLowerCase()
      );
    }

    if (filters.color && filters.color !== "all") {
      filtered = filtered.filter(diamond => 
        diamond.color.toLowerCase() === filters.color?.toLowerCase()
      );
    }

    if (filters.clarity && filters.clarity !== "all") {
      filtered = filtered.filter(diamond => 
        diamond.clarity.toLowerCase() === filters.clarity?.toLowerCase()
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

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredDiamonds(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchQuery, allDiamonds, currentPage, filters]);

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
