
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Upload, Download } from "lucide-react";
import { BackendStatusIndicator } from "./BackendStatusIndicator";

interface InventoryHeaderProps {
  totalCount: number;
  onRefresh: () => void;
  loading: boolean;
  onAddDiamond?: () => void;
}

export function InventoryHeader({ totalCount, onRefresh, loading, onAddDiamond }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Inventory Management
          </h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {totalCount.toLocaleString()} diamonds
          </Badge>
        </div>
        
        {/* Backend Status Indicator */}
        <BackendStatusIndicator />
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage your diamond inventory with real-time FastAPI backend integration
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        {onAddDiamond && (
          <Button
            onClick={onAddDiamond}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Diamond
          </Button>
        )}
      </div>
    </div>
  );
}
