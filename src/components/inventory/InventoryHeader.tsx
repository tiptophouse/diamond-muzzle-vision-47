
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface InventoryHeaderProps {
  totalDiamonds: number;
  onRefresh: () => void;
  loading: boolean;
}

export function InventoryHeader({ totalDiamonds, onRefresh, loading }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your diamond inventory ({totalDiamonds} total diamonds)
          <span className="ml-2 text-xs text-gray-500">Test User: 2138564172</span>
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Diamond
        </Button>
      </div>
    </div>
  );
}
