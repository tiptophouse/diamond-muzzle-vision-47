
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, QrCode, AlertCircle } from "lucide-react";
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
            Manage your diamond inventory ({totalDiamonds} total diamonds)
          </p>
          
          {totalDiamonds === 0 && !loading && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                No diamonds found. Check if your FastAPI server at <strong>api.mazalbot.com</strong> is running and accessible.
                Click "Refresh" to retry the connection.
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
            Connect to FastAPI
          </Button>
        </div>
      </div>
    </div>
  );
}
