
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BulkUploadFormProps {
  onUploadComplete?: (data: any[]) => void;
}

interface ProcessedData {
  diamonds: any[];
  errors: string[];
}

export function BulkUploadForm({ onUploadComplete }: BulkUploadFormProps) {
  const { user } = useOptimizedTelegramAuthContext();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      const csvFiles = fileArray.filter(file => 
        file.name.toLowerCase().endsWith('.csv') || 
        file.name.toLowerCase().endsWith('.xlsx') ||
        file.name.toLowerCase().endsWith('.xls')
      );
      
      if (csvFiles.length !== fileArray.length) {
        toast({
          title: "Invalid files detected",
          description: "Please select only CSV or Excel files",
          variant: "destructive"
        });
      }
      
      setFiles(csvFiles);
    }
  }, [toast]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (!user?.id || files.length === 0) return;

    setIsProcessing(true);
    try {
      // Simulate processing - replace with actual implementation
      const mockProcessedData: ProcessedData = {
        diamonds: files.map((file, index) => ({
          id: index,
          filename: file.name,
          status: 'processed'
        })),
        errors: []
      };
      
      setProcessedData(mockProcessedData);
      
      if (onUploadComplete && mockProcessedData.diamonds.length > 0) {
        onUploadComplete(mockProcessedData.diamonds);
      }

      toast({
        title: "Upload successful",
        description: `${mockProcessedData.diamonds.length} files processed successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process files",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload CSV or Excel Files</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Selected Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
              className="w-full mt-4"
            >
              {isProcessing ? 'Processing...' : 'Process Files'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      {processedData && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Processing Complete</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Successfully processed {processedData.diamonds.length} files
              </p>
              
              {processedData.errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      {processedData.errors.length} errors found
                    </span>
                  </div>
                  <ul className="text-xs text-destructive space-y-1">
                    {processedData.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
