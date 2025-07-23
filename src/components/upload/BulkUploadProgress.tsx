import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Diamond, CheckCircle, AlertCircle } from "lucide-react";

interface DiamondInfo {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  lab: string;
  certificate_number: string;
}

interface BulkUploadProgressProps {
  isUploading: boolean;
  currentDiamond: number;
  totalDiamonds: number;
  currentDiamondInfo?: DiamondInfo;
  successCount: number;
  failureCount: number;
}

export function BulkUploadProgress({ 
  isUploading, 
  currentDiamond, 
  totalDiamonds, 
  currentDiamondInfo,
  successCount,
  failureCount 
}: BulkUploadProgressProps) {
  if (!isUploading || totalDiamonds === 0) return null;

  const progress = (currentDiamond / totalDiamonds) * 100;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Diamond className="h-6 w-6 text-primary animate-pulse" />
          <div className="flex-1">
            <h3 className="font-semibold">Uploading Diamonds...</h3>
            <p className="text-sm text-muted-foreground">
              Processing {currentDiamond} of {totalDiamonds} diamonds
            </p>
          </div>
        </div>

        <Progress value={progress} className="h-3" />

        {currentDiamondInfo && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">
              Current Diamond:
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <Badge variant="outline">{currentDiamondInfo.stock}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shape:</span>
                <Badge variant="outline">{currentDiamondInfo.shape}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <Badge variant="outline">{currentDiamondInfo.weight}ct</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color:</span>
                <Badge variant="outline">{currentDiamondInfo.color}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clarity:</span>
                <Badge variant="outline">{currentDiamondInfo.clarity}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lab:</span>
                <Badge variant="outline">{currentDiamondInfo.lab}</Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Certificate: {currentDiamondInfo.certificate_number}
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>{successCount} succeeded</span>
          </div>
          {failureCount > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{failureCount} failed</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}