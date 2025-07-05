import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

interface EnhancedUploadResultProps {
  result: UploadResult | null;
}

export function EnhancedUploadResult({ result }: EnhancedUploadResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  };

  return (
    <Card className={`${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <CardTitle className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? 'Upload Successful' : 'Upload Failed'}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
          {result.message}
        </p>

        {result.success && (result.fieldMappings || result.unmappedFields) && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-xs p-2 h-auto"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              View Field Mapping Details
            </Button>

            {showDetails && (
              <div className="space-y-4 border-t pt-4">
                {/* Successfully Mapped Fields */}
                {result.fieldMappings && result.fieldMappings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mapped Fields ({result.fieldMappings.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {result.fieldMappings.map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">"{mapping.detectedField}"</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-green-600">{mapping.mappedTo}</span>
                          </div>
                          <Badge variant="secondary" className={`text-xs ${getConfidenceColor(mapping.confidence)}`}>
                            {getConfidenceLabel(mapping.confidence)} ({Math.round(mapping.confidence * 100)}%)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unmapped Fields */}
                {result.unmappedFields && result.unmappedFields.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Unmapped Fields ({result.unmappedFields.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {result.unmappedFields.map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-orange-700 border-orange-200">
                          {field}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      These fields were not automatically mapped but your diamonds were still processed successfully.
                    </p>
                  </div>
                )}

                {/* Summary Stats */}
                {result.processedCount && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-blue-800">Total Processed:</span>
                        <span className="ml-1 text-blue-600">{result.processedCount} diamonds</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Success Rate:</span>
                        <span className="ml-1 text-blue-600">
                          {result.fieldMappings ? Math.round((result.fieldMappings.length / (result.fieldMappings.length + (result.unmappedFields?.length || 0))) * 100) : 100}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {result.errors && result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-800">Errors:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              {result.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}