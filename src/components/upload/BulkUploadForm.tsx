
import React, { useState } from 'react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';
import { useBulkCsvProcessor } from '@/hooks/useBulkCsvProcessor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

export function BulkUploadForm() {
  const { user } = useOptimizedTelegramAuthContext();
  const { processedData, validationResults, processFile, resetProcessor } = useBulkCsvProcessor();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await processFile(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const validRecordsCount = Array.isArray(validationResults) ? validationResults.length : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Diamond Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Upload your CSV file</p>
              <p className="text-gray-600">Choose a CSV file with your diamond inventory</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="csv-upload"
              />
              <Button
                onClick={() => document.getElementById('csv-upload')?.click()}
                disabled={isUploading}
                className="mt-4"
              >
                {isUploading ? 'Processing...' : 'Select CSV File'}
              </Button>
            </div>
          </div>

          {validRecordsCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {validRecordsCount} records ready for upload
                </span>
              </div>
            </div>
          )}

          {processedData.length > 0 && (
            <div className="space-y-4">
              <Button onClick={resetProcessor} variant="outline">
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
