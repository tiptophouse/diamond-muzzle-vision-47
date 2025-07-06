
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Copy } from "lucide-react";

interface InventoryHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  loading?: boolean;
  onAddDiamond?: () => void;
  onRemoveDuplicates?: () => void;
}

export function InventoryHeader({ 
  totalCount, 
  onRefresh, 
  loading = false,
  onAddDiamond,
  onRemoveDuplicates 
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your diamond inventory ({totalCount} items)
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {onAddDiamond && (
          <Button
            onClick={onAddDiamond}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Diamond
          </Button>
        )}
        {onRemoveDuplicates && (
          <Button
            variant="outline"
            onClick={onRemoveDuplicates}
            disabled={loading}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Copy className="mr-2 h-4 w-4" />
            Remove Duplicates
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
