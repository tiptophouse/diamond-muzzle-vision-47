
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
  
  const isTelegramMobile = webApp && (platform === 'android' || platform === 'ios');

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

  const handleMobileFileClick = () => {
    if (isTelegramMobile) {
      hapticFeedback?.impact('light');
      showAlert('Please share your CSV file directly with the bot by forwarding it as a document. The bot will process it automatically.');
      return;
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

  if (isTelegramMobile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">
                Upload CSV on Mobile
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                To upload your CSV file on mobile, share it directly with the bot as a document.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Download className="h-4 w-4" />
                How to upload:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-2 text-left">
                <li>1. Open your file manager or cloud storage</li>
                <li>2. Find your CSV file</li>
                <li>3. Share it with this bot as a document</li>
                <li>4. The bot will process it automatically</li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports CSV, XLSX, and XLS files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
          onClick={handleMobileFileClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Upload CSV File
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <div className="space-y-2">
            <Button variant="outline" onClick={handleMobileFileClick}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground">
              Supports CSV, XLSX, and XLS files up to 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            capture="environment"
          />
        </div>
      </CardContent>
    </Card>
  );
}
