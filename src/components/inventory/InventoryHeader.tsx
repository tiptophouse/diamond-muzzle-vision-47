
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Upload, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your diamond inventory ({totalCount} items)
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/insights')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Insights</span>
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Bulk Upload</span>
        </Button>
        
        <Button 
          onClick={onRefresh} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        
        {onAddDiamond && (
          <Button 
            onClick={onAddDiamond}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Diamond
          </Button>
        )}
      </div>
    </div>
  );
}
