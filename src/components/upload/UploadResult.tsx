
import { CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface UploadResultData {
  totalItems: number;
  successCount: number;
  errors: string[];
  failedRows?: number[];
}

interface UploadResultProps {
  result: UploadResultData | null;
}

export function UploadResult({ result }: UploadResultProps) {
  if (!result) return null;

  const hasErrors = result.errors.length > 0;
  const hasSuccess = result.successCount > 0;
  const hasFailures = result.failedRows && result.failedRows.length > 0;

  const downloadFailedRows = () => {
    if (!result.failedRows) return;
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Failed Row Numbers\n" + 
      result.failedRows.join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "failed_rows.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {hasSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Upload Successful! 🎉</p>
                <p className="text-sm">
                  Successfully processed {result.successCount} out of {result.totalItems} diamonds.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasFailures && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <div className="space-y-3">
              <div>
                <p className="font-medium">Partial Upload Issues</p>
                <p className="text-sm">
                  {result.failedRows?.length} rows failed to upload. These diamonds were not added to your inventory.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadFailedRows}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Failed Rows
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasErrors && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Upload Errors:</p>
              <ul className="list-disc pl-4 space-y-1">
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-sm italic">
                    ... and {result.errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result.totalItems === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">No Data Found</p>
              <p className="text-sm">
                No valid data was found in your file. Please check:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>File contains headers (Stock#, Shape, Weight, Color, Clarity, etc.)</li>
                <li>File has at least one data row</li>
                <li>Data is properly formatted (numbers for Weight and Price/Crt)</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasSuccess && !hasErrors && !hasFailures && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <div className="space-y-2">
              <p className="font-medium">Next Steps:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Your diamonds are now visible in your inventory</li>
                <li>• They are automatically set to be visible in the store</li>
                <li>• You can edit individual diamonds from the inventory page</li>
                <li>• Check the store page to see how they appear to customers</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
