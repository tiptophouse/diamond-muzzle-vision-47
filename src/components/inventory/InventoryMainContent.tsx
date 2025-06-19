
import { InventoryTable } from "./InventoryTable";
import { InventoryPagination } from "./InventoryPagination";
import { Diamond } from "./InventoryTable";

interface InventoryMainContentProps {
  filteredDiamonds: Diamond[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamondId: string) => Promise<void>;
  onStoreToggle: (stockNumber: string, isVisible: boolean) => Promise<void>;
  onPageChange: (page: number) => void;
}

export function InventoryMainContent({
  filteredDiamonds,
  loading,
  currentPage,
  totalPages,
  onEdit,
  onDelete,
  onStoreToggle,
  onPageChange
}: InventoryMainContentProps) {
  return (
    <main className="flex-1">
      <div className="space-y-4">
        <InventoryTable
          data={filteredDiamonds}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
          onStoreToggle={onStoreToggle}
        />
        
        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </main>
  );
}
