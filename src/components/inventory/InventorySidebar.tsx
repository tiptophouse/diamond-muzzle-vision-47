
import { InventorySearch } from "./InventorySearch";
import { InventoryFilters } from "./InventoryFilters";
import { Diamond } from "./InventoryTable";

interface InventorySidebarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  allDiamonds: Diamond[];
  onFilterChange: (filters: Record<string, string>) => void;
}

export function InventorySidebar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  allDiamonds,
  onFilterChange
}: InventorySidebarProps) {
  return (
    <aside className="lg:w-80">
      <div className="space-y-6">
        <InventorySearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSubmit={onSearchSubmit}
          allDiamonds={allDiamonds}
        />
        <InventoryFilters onFilterChange={onFilterChange} />
      </div>
    </aside>
  );
}
