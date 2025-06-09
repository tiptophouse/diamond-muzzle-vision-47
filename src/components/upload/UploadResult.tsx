
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadResultData {
  totalItems: number;
  successCount: number;
  errors: string[];
}

interface UploadResultProps {
  result: UploadResultData | null;
}

export function UploadResult({ result }: UploadResultProps) {
  if (!result) return null;

  const hasErrors = result.errors.length > 0;
  const hasSuccess = result.successCount > 0;

  return (
    <div className="space-y-4">
      {hasSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Successfully processed {result.successCount} out of {result.totalItems} diamonds.
          </AlertDescription>
        </Alert>
      )}

      {hasErrors && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Upload completed with errors:</p>
              <ul className="list-disc pl-4 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result.totalItems === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No data was processed. Please check your CSV file format.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
