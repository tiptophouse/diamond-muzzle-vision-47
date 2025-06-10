
import { OptimizedInventoryDashboard } from "./OptimizedInventoryDashboard";
import { Diamond } from "./InventoryTable";

interface InventoryDashboardProps {
  diamonds: Diamond[];
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamondId: string) => void;
  onDuplicate: (diamond: Diamond) => void;
  onBulkEdit: (selectedIds: string[]) => void;
  onBulkDelete: (selectedIds: string[]) => void;
  loading: boolean;
}

export function InventoryDashboard({
  diamonds,
  onEdit,
  onDelete,
  onDuplicate,
  onBulkEdit,
  onBulkDelete,
  loading,
}: InventoryDashboardProps) {
  return (
    <OptimizedInventoryDashboard
      diamonds={diamonds}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onBulkEdit={onBulkEdit}
      onBulkDelete={onBulkDelete}
      onRefresh={() => window.location.reload()}
    />
  );
}
