
import { useState, useEffect } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { Diamond } from "@/components/inventory/InventoryTable";

interface ReportsContentProps {
  allDiamonds: Diamond[];
  loading: boolean;
  onRefresh: () => void;
}

export function ReportsContent({ allDiamonds, loading, onRefresh }: ReportsContentProps) {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const filtered = allDiamonds.filter((diamond) => {
      const searchRegex = new RegExp(searchQuery, "i");
      const searchMatch =
        searchQuery === "" ||
        Object.values(diamond).some((value) =>
          String(value).match(searchRegex)
        );

      const filterMatch = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(diamond[key as keyof Diamond])
          .toLowerCase()
          .includes(value.toLowerCase());
      });

      return searchMatch && filterMatch;
    });

    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedDiamonds = filtered.slice(startIndex, endIndex);

    setDiamonds(paginatedDiamonds);
    setTotalPages(Math.ceil(filtered.length / 10));
  }, [allDiamonds, currentPage, filters, searchQuery]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-6">
      <InventoryHeader
        totalDiamonds={allDiamonds.length}
        onRefresh={onRefresh}
        loading={loading}
      />
      
      <div className="space-y-4">
        <InventorySearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSubmit={handleSearch}
          allDiamonds={allDiamonds}
        />
        
        <InventoryFilters onFilterChange={handleFilterChange} />
      </div>
      
      <InventoryTable
        data={diamonds}
        loading={loading}
      />
      
      <InventoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
