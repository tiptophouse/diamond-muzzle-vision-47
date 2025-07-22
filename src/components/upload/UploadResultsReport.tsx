import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertTriangle, Download, RotateCcw } from "lucide-react";

interface UploadResultsReportProps {
  results: {
    successCount: number;
    failureCount: number;
    totalAttempted: number;
    errors: Array<{ row: number; error: string; data: any }>;
  };
  onReset: () => void;
}

export function UploadResultsReport({ results, onReset }: UploadResultsReportProps) {
  const successRate = ((results.successCount / results.totalAttempted) * 100).toFixed(1);
  
  const downloadFailedData = () => {
    if (results.errors.length === 0) return;
    
    const csvContent = [
      ['Row', 'Error', 'Data'],
      ...results.errors.map(error => [
        error.row.toString(),
        error.error,
        JSON.stringify(error.data)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed_diamonds.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Upload Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{results.successCount}</div>
            <p className="text-sm text-muted-foreground">Successfully Uploaded</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{results.failureCount}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{results.totalAttempted}</div>
            <p className="text-sm text-muted-foreground">Total Attempted</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {results.successCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3" />
              {results.successCount} Uploaded
            </Badge>
          )}
          {results.failureCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {results.failureCount} Failed
            </Badge>
          )}
        </div>

        {/* Error Details */}
        {results.errors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-amber-800">Failed Uploads Details</h4>
            </div>
            
            <ScrollArea className="h-32 w-full border rounded-md p-3">
              <div className="space-y-2">
                {results.errors.map((error, index) => (
                  <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Row {error.row}</Badge>
                      <span className="text-red-600 font-medium">{error.error}</span>
                    </div>
                    {error.data && Object.keys(error.data).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 ml-2">
                        Data: {JSON.stringify(error.data, null, 2).slice(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {results.errors.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadFailedData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Failed Data
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Upload More Files
          </Button>
        </div>

        {/* Success Message */}
        {results.failureCount === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Perfect Upload!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              All {results.successCount} diamonds were successfully uploaded to your inventory.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}