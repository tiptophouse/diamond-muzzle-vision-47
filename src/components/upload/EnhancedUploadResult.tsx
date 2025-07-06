import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadSuccessCard } from "./UploadSuccessCard";

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

  // Helper functions for confidence display
  function getConfidenceColor(confidence: number) {
    if (confidence >= 0.9) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  }

  function getConfidenceLabel(confidence: number) {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  }

  if (!result) return null;

  // Use the beautiful success card for successful uploads
  if (result.success) {
    return (
      <div className="my-6">
        <UploadSuccessCard
          title="CSV Uploaded Successfully"
          description={`${result.processedCount || 0} diamonds processed with intelligent field mapping. ${result.fieldMappings?.length || 0} fields mapped automatically.`}
          showActions={false}
        />
        
        {/* Detailed Information Section */}
        {(result.fieldMappings || result.unmappedFields) && (
          <Card className="mt-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full justify-between text-muted-foreground hover:text-foreground mb-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  📊 Processing Details
                </span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showDetails && (
                <div className="space-y-4 border-t pt-4 animate-fade-in">
                  {/* Successfully Mapped Fields */}
                  {result.fieldMappings && result.fieldMappings.length > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                      <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Successfully Mapped Fields ({result.fieldMappings.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {result.fieldMappings.map((mapping, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-emerald-100 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-700 px-2 py-1 bg-slate-100 rounded text-xs">
                                "{mapping.detectedField}"
                              </span>
                              <span className="text-emerald-500 font-bold">→</span>
                              <span className="font-semibold text-emerald-700 px-2 py-1 bg-emerald-100 rounded text-xs">
                                {mapping.mappedTo}
                              </span>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs font-medium ${getConfidenceColor(mapping.confidence)}`}
                            >
                              {getConfidenceLabel(mapping.confidence)} ({Math.round(mapping.confidence * 100)}%)
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmapped Fields */}
                  {result.unmappedFields && result.unmappedFields.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                      <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Fields Not Mapped ({result.unmappedFields.length})
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.unmappedFields.map((field, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">
                            {field}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        💡 These fields weren't automatically mapped, but your diamonds were processed successfully.
                      </p>
                    </div>
                  )}

                  {/* Summary Stats */}
                  {result.processedCount && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.processedCount}</div>
                          <div className="text-xs text-blue-800 font-medium">Diamonds Processed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {result.fieldMappings ? Math.round((result.fieldMappings.length / (result.fieldMappings.length + (result.unmappedFields?.length || 0))) * 100) : 100}%
                          </div>
                          <div className="text-xs text-green-800 font-medium">Success Rate</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Error state with enhanced styling
  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <XCircle className="h-5 w-5 text-white" />
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
              <AlertCircle className="h-4 w-4" />
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