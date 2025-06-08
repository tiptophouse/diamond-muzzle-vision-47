
import { InventoryTable } from "./InventoryTable";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryHeader } from "./InventoryHeader";
import { InventorySearch } from "./InventorySearch";
import { InventoryPagination } from "./InventoryPagination";
import { Diamond } from "./InventoryTable";

interface InventoryContentProps {
  diamonds: Diamond[];
  allDiamonds: Diamond[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onFilterChange: (filters: Record<string, string>) => void;
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamondId: string) => void;
  onToggleStoreVisibility: (diamond: Diamond) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onQRScan: () => void;
  handleSearch: (e: React.FormEvent) => void;
}

export function InventoryContent({
  diamonds,
  allDiamonds,
  loading,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  onFilterChange,
  onEdit,
  onDelete,
  onToggleStoreVisibility,
  onRefresh,
  onAdd,
  onQRScan,
  handleSearch,
}: InventoryContentProps) {
  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      <InventoryHeader
        totalDiamonds={allDiamonds.length}
        onRefresh={onRefresh}
        onAdd={onAdd}
        onQRScan={onQRScan}
        loading={loading}
      />
      
      <div className="w-full space-y-4">
        <InventorySearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSubmit={handleSearch}
          allDiamonds={allDiamonds}
        />
        
        <InventoryFilters onFilterChange={onFilterChange} />
      </div>
      
      <div className="w-full overflow-x-hidden">
        <InventoryTable
          data={diamonds}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStoreVisibility={onToggleStoreVisibility}
        />
      </div>
      
      <InventoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
