import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import { AIUploadSummary } from "./AIUploadSummary";

interface FieldMapping {
  detectedField: string;
  mappedTo: string;
  confidence: number;
}

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
  fieldMappings?: FieldMapping[];
  unmappedFields?: string[];
  totalProcessed?: number;
}

interface EnhancedUploadResultProps {
  result: UploadResult | null;
  fileName?: string;
}

export function EnhancedUploadResult({ result, fileName }: EnhancedUploadResultProps) {
  if (!result) return null;

  // Show beautiful AI summary for successful uploads
  if (result.success && result.processedCount && result.processedCount > 0) {
    const analytics = {
      totalRows: result.totalProcessed || result.processedCount,
      successfulUploads: result.processedCount,
      failedUploads: result.errors?.length || 0,
      fieldMappings: result.fieldMappings?.length || 0,
      unmappedFields: result.unmappedFields || [],
      errors: result.errors,
    };

    return (
      <AIUploadSummary 
        analytics={analytics} 
        fileName={fileName || 'upload.csv'} 
      />
    );
  }

  // Error state with enhanced styling
  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-red-800 text-lg font-semibold">Upload Failed</CardTitle>
            <p className="text-red-600 text-sm">Please check the details below and try again</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-red-100 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">{result.message}</p>
        </div>

        {result.errors && result.errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Details:
            </h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-700 space-y-2">
                {result.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}