
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface BulkUploadProgressProps {
  progress: number;
  uploadedCount: number;
  totalCount: number;
  failedCount: number;
  errors: string[];
  isUploading: boolean;
}

export function BulkUploadProgress({
  progress,
  uploadedCount,
  totalCount,
  failedCount,
  errors,
  isUploading
}: BulkUploadProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Upload Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-700">{uploadedCount}</div>
            <div className="text-green-600">Uploaded</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="font-semibold text-red-700">{failedCount}</div>
            <div className="text-red-600">Failed</div>
          </div>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Upload Errors:</div>
                {errors.slice(0, 3).map((error, index) => (
                  <div key={index} className="text-sm">{error}</div>
                ))}
                {errors.length > 3 && (
                  <div className="text-sm">... and {errors.length - 3} more errors</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
