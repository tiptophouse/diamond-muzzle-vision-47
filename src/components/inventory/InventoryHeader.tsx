
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, QrCode } from "lucide-react";
import { BackendStatusIndicator } from "./BackendStatusIndicator";

interface InventoryHeaderProps {
  totalDiamonds: number;
  onRefresh: () => void;
  onAdd: () => void;
  onQRScan: () => void;
  loading?: boolean;
}

export function InventoryHeader({ 
  totalDiamonds, 
  onRefresh, 
  onAdd, 
  onQRScan, 
  loading = false 
}: InventoryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Diamond Inventory
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {totalDiamonds} diamonds in your collection
          </p>
        </div>
        <BackendStatusIndicator />
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          onClick={onQRScan}
          className="flex items-center gap-2"
        >
          <QrCode className="h-4 w-4" />
          Scan GIA
        </Button>
        
        <Button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Diamond
        </Button>
      </div>
    </div>
  );
}
