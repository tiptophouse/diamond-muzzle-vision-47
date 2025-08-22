
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";

interface InventoryHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  loading?: boolean;
  onAddDiamond?: () => void;
  onAddNew?: () => void;
}

export function InventoryHeader({
  totalCount,
  onRefresh,
  loading = false,
  onAddDiamond,
  onAddNew
}: InventoryHeaderProps) {
  const handleAddNew = onAddNew || onAddDiamond;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your diamond inventory ({totalCount} items)
        </p>
      </div>
      
      <div className="flex gap-2">
        {handleAddNew && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Diamond
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
