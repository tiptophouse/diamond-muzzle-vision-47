
import { InventoryHeader } from "./InventoryHeader";
import { InventorySearch } from "./InventorySearch";
import { InventoryFilters } from "./InventoryFilters";
import { Diamond } from "./InventoryTable";

interface InventoryPageHeaderProps {
  totalDiamonds: number;
  loading: boolean;
  searchQuery: string;
  allDiamonds: Diamond[];
  onRefresh: () => void;
  onAdd: () => void;
  onQRScan: () => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onFilterChange: (filters: Record<string, string>) => void;
}

export function InventoryPageHeader({
  totalDiamonds,
  loading,
  searchQuery,
  allDiamonds,
  onRefresh,
  onAdd,
  onQRScan,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
}: InventoryPageHeaderProps) {
  return (
    <>
      <InventoryHeader
        totalDiamonds={totalDiamonds}
        onRefresh={onRefresh}
        onAdd={onAdd}
        onQRScan={onQRScan}
        loading={loading}
      />
      
      <div className="w-full space-y-4">
        <InventorySearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSubmit={onSearchSubmit}
          allDiamonds={allDiamonds}
        />
        
        <InventoryFilters onFilterChange={onFilterChange} />
      </div>
    </>
  );
}
