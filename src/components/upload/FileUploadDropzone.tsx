
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

interface FileUploadDropzoneProps {
  onFileSelect: (file: File, data: any[]) => void;
  accept: string;
  maxSize: number;
}

export function FileUploadDropzone({ onFileSelect, accept, maxSize }: FileUploadDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Mock CSV data for now
      onFileSelect(file, []);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xlsx', '.xls'] },
    maxSize,
    multiple: false
  });

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-8">
        <div {...getRootProps()} className="cursor-pointer text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary animate-bounce" />
              ) : (
                <FileText className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the file here' : 'Drop your CSV file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
