import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Download, Clock, FileType, Sparkles } from "lucide-react";

interface ProcessingReportProps {
  report: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    fileType: string;
    processingTime: number;
    aiExtracted: boolean;
  };
  onDownloadFailed: () => void;
  hasFailedRecords: boolean;
}

export function ProcessingReport({ report, onDownloadFailed, hasFailedRecords }: ProcessingReportProps) {
  const successRate = ((report.successCount / report.totalProcessed) * 100).toFixed(1);
  
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Processing Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{report.successCount}</div>
            <p className="text-sm text-muted-foreground">Successfully Processed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{report.failureCount}</div>
            <p className="text-sm text-muted-foreground">Failed Records</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{report.totalProcessed}</div>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </div>
        </div>

        {/* Processing Details */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileType className="h-3 w-3" />
            {report.fileType} Format
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {(report.processingTime / 1000).toFixed(2)}s
          </Badge>
          {report.aiExtracted && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Enhanced
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {hasFailedRecords && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownloadFailed}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Failed Records
            </Button>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Ready for upload</span>
          </div>
          {report.failureCount > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm">Some records need attention</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}