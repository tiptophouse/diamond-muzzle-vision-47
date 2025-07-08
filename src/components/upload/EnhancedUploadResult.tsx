import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText, TrendingUp, File, Database, MapPin } from "lucide-react";
import { AIUploadSummary } from "./AIUploadSummary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
  const [showDetails, setShowDetails] = useState(false);
  
  if (!result) return null;

  // Show enhanced summary for successful uploads
  if (result.success && result.processedCount && result.processedCount > 0) {
    return (
      <div className="space-y-4">
        {/* File Summary Card */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-800 text-lg font-semibold">Upload Successful!</CardTitle>
                <p className="text-green-600 text-sm">{fileName || 'File'} processed successfully</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{result.processedCount}</div>
                <div className="text-xs text-green-600 uppercase tracking-wide">Diamonds Added</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{result.fieldMappings?.length || 0}</div>
                <div className="text-xs text-blue-600 uppercase tracking-wide">Fields Mapped</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">{result.totalProcessed || result.processedCount}</div>
                <div className="text-xs text-purple-600 uppercase tracking-wide">Total Rows</div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-700">{result.errors?.length || 0}</div>
                <div className="text-xs text-orange-600 uppercase tracking-wide">Errors</div>
              </div>
            </div>

            {/* Field Mappings Summary */}
            {result.fieldMappings && result.fieldMappings.length > 0 && (
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      View Field Mapping Details
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-white/70 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Detected Field Mappings:
                    </h4>
                    <div className="grid gap-2">
                      {result.fieldMappings.map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <span className="text-sm font-medium text-gray-700">"{mapping.detectedField}"</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">→</span>
                            <Badge variant="secondary" className="text-xs">{mapping.mappedTo}</Badge>
                            <Badge 
                              variant={mapping.confidence > 0.8 ? "default" : "outline"} 
                              className="text-xs"
                            >
                              {Math.round(mapping.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {result.unmappedFields && result.unmappedFields.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-yellow-700 mb-2">Unmapped Fields:</h5>
                        <div className="flex flex-wrap gap-1">
                          {result.unmappedFields.map((field, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-yellow-700">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Processing Warnings:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.errors.slice(0, 3).map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                  {result.errors.length > 3 && (
                    <li className="text-xs text-yellow-600 mt-2">
                      ... and {result.errors.length - 3} more warnings
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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