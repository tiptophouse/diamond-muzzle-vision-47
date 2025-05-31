
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
      </div>
    </div>
  );
}
