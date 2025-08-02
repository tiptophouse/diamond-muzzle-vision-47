
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { apiEndpoints } from '@/lib/api/endpoints';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useFeedback } from '@/components/feedback/FeedbackProvider';

interface DiamondData {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  price_per_carat: number;
}

interface UploadResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errorCount?: number;
  errors?: string[];
}

export default function UploadPage() {
  const [csvData, setCsvData] = useState<DiamondData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<DiamondData[]>([]);
  
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { trackFeatureUsage } = useFeedback();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const processedData = results.data.map((row: any) => ({
              stock_number: row.stock_number || '',
              shape: row.shape || '',
              weight: parseFloat(row.weight) || 0,
              color: row.color || '',
              clarity: row.clarity || '',
              cut: row.cut || '',
              polish: row.polish || '',
              symmetry: row.symmetry || '',
              price_per_carat: parseFloat(row.price_per_carat) || 0,
            }));

            setCsvData(processedData);
            setPreviewData(processedData.slice(0, 5));
            setUploadResult(null);

            toast({
              title: "CSV loaded successfully",
              description: `Found ${processedData.length} diamonds to process`,
            });
          } catch (error) {
            toast({
              title: "CSV parsing error",
              description: "Failed to parse CSV file",
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          toast({
            title: "CSV parsing error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    };

    reader.onerror = () => {
      toast({
        title: "File reading error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!csvData.length || !user?.id) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await api.uploadCsv(
        apiEndpoints.uploadCsv(user.id),
        csvData,
        user.id
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const result: UploadResult = {
        success: true,
        message: "Upload completed successfully",
        processedCount: csvData.length,
        errorCount: 0,
      };

      setUploadResult(result);
      trackFeatureUsage('csv_upload', true, { 
        diamond_count: csvData.length,
        file_size: csvData.length 
      });

      toast({
        title: "✅ Upload successful",
        description: `Successfully uploaded ${csvData.length} diamonds`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      const result: UploadResult = {
        success: false,
        message: errorMessage,
        processedCount: 0,
        errorCount: csvData.length,
        errors: [errorMessage],
      };

      setUploadResult(result);
      trackFeatureUsage('csv_upload', false, { 
        diamond_count: csvData.length,
        error: errorMessage 
      });

      toast({
        title: "❌ Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const resetUpload = () => {
    setCsvData([]);
    setPreviewData([]);
    setUploadResult(null);
    setUploadProgress(0);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Diamond Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!csvData.length ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p>Drop the CSV file here...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop a CSV file here, or click to select
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supported format: CSV with diamond data
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>CSV loaded: {csvData.length} diamonds</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetUpload}>
                    Upload Different File
                  </Button>
                </div>

                {/* Preview Data */}
                {previewData.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Preview (first 5 rows):</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Stock #</th>
                            <th className="text-left p-2">Shape</th>
                            <th className="text-left p-2">Weight</th>
                            <th className="text-left p-2">Color</th>
                            <th className="text-left p-2">Clarity</th>
                            <th className="text-left p-2">Price/Ct</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((diamond, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{diamond.stock_number}</td>
                              <td className="p-2">{diamond.shape}</td>
                              <td className="p-2">{diamond.weight}</td>
                              <td className="p-2">{diamond.color}</td>
                              <td className="p-2">{diamond.clarity}</td>
                              <td className="p-2">${diamond.price_per_carat}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !user?.id}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>Uploading... ({uploadProgress}%)</>
                    ) : (
                      <>Upload {csvData.length} Diamonds</>
                    )}
                  </Button>
                </div>

                {/* Progress Bar */}
                {uploading && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Results */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant={uploadResult.success ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadResult.message}
                  {uploadResult.processedCount !== undefined && (
                    <div className="mt-2">
                      Processed: {uploadResult.processedCount} diamonds
                      {uploadResult.errorCount !== undefined && uploadResult.errorCount > 0 && (
                        <div>Errors: {uploadResult.errorCount}</div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600">Errors:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-2">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
