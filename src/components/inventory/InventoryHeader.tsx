
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { DataExportButton } from "./DataExportButton";

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your diamond inventory ({totalCount} items stored locally)
        </p>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <DataExportButton />
        {onAddDiamond && (
          <Button
            onClick={onAddDiamond}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Diamond
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
