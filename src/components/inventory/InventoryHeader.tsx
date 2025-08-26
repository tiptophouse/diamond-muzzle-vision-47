import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
interface InventoryHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  loading?: boolean;
  onAddDiamond?: () => void;
}
export function InventoryHeader({
  totalCount,
  onRefresh,
  loading = false,
  onAddDiamond
}: InventoryHeaderProps) {
  return <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your diamond inventory ({totalCount} items)
        </p>
      </div>
      
      
    </div>;
}