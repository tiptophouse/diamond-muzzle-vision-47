
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValidationResults {
  totalRows: number;
  validRows: number;
  skippedRows: number;
  fieldMappings: Array<{ csvHeader: string; mappedTo: string; confidence: number }>;
  errors: Array<{ row: number; field: string; value: string; reason: string }>;
  warnings: Array<{ message: string }>;
}

interface CsvValidationResultsProps {
  results: ValidationResults;
}

export function CsvValidationResults({ results }: CsvValidationResultsProps) {
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{results.validRows}</div>
            <p className="text-sm text-muted-foreground">Valid Diamonds</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{results.skippedRows}</div>
            <p className="text-sm text-muted-foreground">Skipped Rows</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-foreground">{results.totalRows}</div>
            <p className="text-sm text-muted-foreground">Total Rows</p>
          </CardContent>
        </Card>
      </div>

      {/* Field Mappings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Column Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.fieldMappings.map((mapping, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="font-medium">{mapping.csvHeader}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{mapping.mappedTo}</Badge>
                  <Badge variant={mapping.confidence > 0.8 ? "default" : "outline"}>
                    {Math.round(mapping.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {results.warnings.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Warnings ({results.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                  {warning.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {results.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Validation Errors ({results.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {results.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                    <div className="font-medium">Row {error.row}: {error.field}</div>
                    <div className="text-xs">"{error.value}" - {error.reason}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
