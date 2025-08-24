import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, FileText, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';
import { useBulkCsvProcessor } from '@/hooks/useBulkCsvProcessor';
import { toast } from '@/hooks/use-toast';

interface BulkUploadFormProps {
  onUploadSuccess: (count: number) => void;
}

export function BulkUploadForm({ onUploadSuccess }: BulkUploadFormProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useOptimizedTelegramAuthContext();
  const { validationResults, processCsv } = useBulkCsvProcessor();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setCsvFile(file || null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    setCsvFile(file || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!csvFile || !user) {
      toast({
        title: 'Missing File or User',
        description: 'Please select a CSV file and ensure you are authenticated.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const parsedDiamonds = await processCsv(csvFile);

      if (!parsedDiamonds || parsedDiamonds.length === 0) {
        setUploadError('No valid diamonds found in the CSV file.');
        toast({
          title: 'No Valid Diamonds',
          description: 'The CSV file does not contain any valid diamond records.',
          variant: 'destructive',
        });
        return;
      }

      // Simulate upload progress
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress((i / totalSteps) * 100);
      }

      onUploadSuccess(parsedDiamonds.length);
      toast({
        title: 'Upload Complete',
        description: `${parsedDiamonds.length} diamonds uploaded successfully!`,
      });
      resetForm();
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'An error occurred during upload.');
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  const handleManualValidationError = (message: string) => {
    setUploadError(message);
    toast({
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* File Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        {csvFile ? (
          <div className="flex items-center justify-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>{csvFile.name}</span>
          </div>
        ) : (
          <div>
            <Upload className="h-6 w-6 mx-auto text-gray-400" />
            <p className="text-gray-500">
              Drag and drop a CSV file here or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Validation Results */}
      {validationResults && validationResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Validation Results:</h3>
          <ul>
            {validationResults.map((result, index) => (
              <li key={index} className="flex items-center space-x-2">
                {result.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{result.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploading...</p>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Upload Button */}
      <Button onClick={handleUpload} disabled={isUploading || !csvFile}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </>
        )}
      </Button>
    </div>
  );
}
