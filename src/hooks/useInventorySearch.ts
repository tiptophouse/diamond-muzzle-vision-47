
import { useState, useEffect } from "react";
import { Diamond } from "@/components/inventory/InventoryTable";

export function useInventorySearch(allDiamonds: Diamond[], currentPage: number) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDiamonds, setFilteredDiamonds] = useState<Diamond[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const itemsPerPage = 10;
    let filtered = allDiamonds;

    if (searchQuery) {
      filtered = allDiamonds.filter(diamond =>
        diamond.stockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.clarity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredDiamonds(filtered.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchQuery, allDiamonds, currentPage]);

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
