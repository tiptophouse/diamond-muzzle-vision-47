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
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold truncate">Inventory</h1>
        <p className="text-xs text-muted-foreground">
          {totalCount} diamonds
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-9 px-3"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        
        {onAddDiamond && (
          <Button
            variant="default"
            size="sm"
            onClick={onAddDiamond}
            className="h-9 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        )}
      </div>
    </div>
  );
}