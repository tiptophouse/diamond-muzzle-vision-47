
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, QrCode, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InventoryHeaderProps {
  totalDiamonds: number;
  onRefresh: () => void;
  onAdd?: () => void;
  onQRScan?: () => void;
  loading: boolean;
}

export function InventoryHeader({ totalDiamonds, onRefresh, onAdd, onQRScan, loading }: InventoryHeaderProps) {
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
                  'Showing sample diamonds. Your FastAPI server may be offline - click "Sync Data" to try reconnecting.' :
                  `Successfully loaded ${totalDiamonds} diamonds from your inventory system.`
                }
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {onAdd && (
            <Button 
              onClick={onAdd}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Diamond
            </Button>
          )}
          {onQRScan && (
            <Button 
              onClick={onQRScan}
              variant="outline"
              className="w-full sm:flex-1 border-green-300 text-green-700 hover:bg-green-50"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan GIA QR
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={loading}
            className="w-full sm:flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
        </div>
      </div>
    </div>
  );
}
