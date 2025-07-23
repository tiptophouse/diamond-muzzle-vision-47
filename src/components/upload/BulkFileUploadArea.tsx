
import { useRef } from "react";
import { Upload, FileSpreadsheet, XCircle, Loader2, Phone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface BulkFileUploadAreaProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onReset: () => void;
  isProcessing: boolean;
}

export function BulkFileUploadArea({ 
  selectedFile, 
  onFileChange, 
  onReset, 
  isProcessing 
}: BulkFileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { webApp, hapticFeedback, showAlert, platform } = useTelegramWebApp();
  
  // Always show file picker for now - simplified approach
  const isTelegramApp = !!webApp;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - support multiple formats
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        onFileChange(null);
        return;
      }
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        onFileChange(file);
      }
    }
  };

  const handleFileClick = () => {
    if (isTelegramApp) {
      hapticFeedback?.impact('light');
    }
    fileInputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {isProcessing ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB • {isProcessing ? 'Processing...' : 'Ready for validation'}
              </p>
            </div>
            {!isProcessing && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset}
                className="flex-shrink-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload CSV File
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select your CSV file to upload diamonds in bulk
            </p>
          </div>
          
          <Button 
            onClick={handleFileClick}
            size="lg"
            className="w-full h-14 text-lg"
            variant="outline"
          >
            <FileSpreadsheet className="h-5 w-5 mr-3" />
            Choose CSV File
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Supports CSV, XLSX, and XLS files up to 10MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
}
