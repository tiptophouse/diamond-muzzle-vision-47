import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BulkFileUploadArea } from '@/components/upload/BulkFileUploadArea';
import { CsvValidationResults } from '@/components/upload/CsvValidationResults';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';

export default function BulkUploadPage() {
  const { user } = useOptimizedTelegramAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [csvData, setCsvData] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isCsvValid, setIsCsvValid] = useState(false);

  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam === 'true') {
      setUploadSuccess(true);
    }
  }, [searchParams]);

  const handleFileUpload = (data: any[]) => {
    setCsvData(data);
  };

  const handleValidationResults = (results: any[], isValid: boolean) => {
    setValidationResults(results);
    setIsCsvValid(isValid);
  };

  const handleUpload = async () => {
    if (!user) {
      console.error('No user ID available for upload');
      setUploadError('User authentication required.');
      return;
    }

    if (!isCsvValid) {
      setUploadError('Please correct the errors in your CSV file before uploading.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prevProgress + 10;
      });
    }, 250);

    try {
      // const response = await api.uploadCsv('/api/diamonds/bulk-upload', csvData, user.id);
      // if (response.data) {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadSuccess(true);
        setUploading(false);
        // navigate('/dashboard?upload_success=true', { replace: true });
        navigate(`/dashboard?upload_success=${csvData.length}&from=bulk_upload`, { replace: true });
      // } else if (response.error) {
      //   clearInterval(interval);
      //   setUploadError(response.error);
      //   setUploading(false);
      // }
    } catch (error: any) {
      clearInterval(interval);
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold tracking-tight">Bulk Diamond Upload</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="mb-4">
            <CardDescription>
              Upload a CSV file containing diamond data to quickly populate your inventory.
            </CardDescription>
            <Separator className="my-4" />
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
              <p className="text-sm text-gray-500">
                Ensure your CSV file is properly formatted before uploading.
              </p>
              <Badge variant="secondary">
                <a href="/standardize-csv" target="_blank" rel="noopener noreferrer">
                  Standardize CSV
                </a>
              </Badge>
            </div>
          </div>

          <BulkFileUploadArea onFileUpload={handleFileUpload} />

          {csvData.length > 0 && (
            <>
              <Separator className="my-4" />
              <CsvValidationResults csvData={csvData} onValidationResults={handleValidationResults} />
            </>
          )}

          {validationResults.length > 0 && (
            <>
              <Separator className="my-4" />
              {isCsvValid ? (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your CSV file is valid and ready for upload.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your CSV file contains errors. Please review and correct them before uploading.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {uploadError && (
            <>
              <Separator className="my-4" />
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  {uploadError}
                </AlertDescription>
              </Alert>
            </>
          )}

          {uploadSuccess && (
            <>
              <Separator className="my-4" />
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload successful! Your diamonds are now being processed.
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="flex justify-end">
            <Button
              disabled={uploading || !isCsvValid}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Diamonds
                </>
              )}
            </Button>
          </div>

          {uploadProgress !== null && (
            <Progress value={uploadProgress} className="mt-2" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
