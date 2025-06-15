import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Remove any QR scan functionality from InventoryHeader

interface InventoryHeaderProps {
  totalDiamonds: number;
  onRefresh: () => void;
  onAdd?: () => void;
  loading: boolean;
}

export function InventoryHeader({ totalDiamonds, loading }: InventoryHeaderProps) {
  return (
    <div className="w-full bg-background">
      <div className="flex flex-col space-y-4">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Manage your diamond inventory ({totalDiamonds} diamonds loaded)
          </p>
          
          {totalDiamonds > 0 && !loading && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {totalDiamonds === 5 ? 
                  'Showing sample diamonds. Your FastAPI server may be offline - click "Sync Data" on the Upload page to try reconnecting.' :
                  `Successfully loaded ${totalDiamonds} diamonds from your inventory system.`
                }
              </AlertDescription>
            </Alert>
          )}
        </div>
        {/* Removed Add Diamond & Sync Data buttons */}
      </div>
    </div>
  );
}
