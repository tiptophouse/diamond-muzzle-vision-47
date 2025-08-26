
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadDropzoneProps {
  onFileSelect: (file: File, data: any[]) => void;
  accept: string;
  maxSize: number;
}

export function FileUploadDropzone({ onFileSelect, accept, maxSize }: FileUploadDropzoneProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file, []);
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-8">
        <div className="cursor-pointer text-center">
          <input 
            type="file" 
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Choose your CSV file
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
              <Button type="button" variant="outline">
                Select File
              </Button>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
