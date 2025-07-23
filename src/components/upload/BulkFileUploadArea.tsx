
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, XCircle, Loader2, Smartphone } from "lucide-react";
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
  const { hapticFeedback, webApp } = useTelegramWebApp();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      hapticFeedback?.selection();
      
      // Validate file type - support multiple formats
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        hapticFeedback?.notification('error');
        onFileChange(null);
        return;
      }
      
      hapticFeedback?.notification('success');
      onFileChange(file);
    }
  };

  // Handle file selection for Telegram Mini App
  const handleTelegramFileUpload = () => {
    hapticFeedback?.impact('light');
    
    // Check if we're in Telegram environment
    if (webApp) {
      // Show instructions for Telegram users
      hapticFeedback?.notification('warning');
      
      // In Telegram Mini Apps, file uploads need to be handled differently
      // Users should send files directly to the bot
      webApp.showAlert(
        "To upload CSV files in Telegram:\n\n" +
        "1. Send your CSV file directly to @YourBotName\n" +
        "2. The bot will process it automatically\n" +
        "3. Return here to see your uploaded diamonds\n\n" +
        "This is required for security in Telegram Mini Apps."
      );
      return;
    }
    
    // Fallback for non-Telegram environments
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.multiple = false;
    
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    input.style.top = '-9999px';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect({ target: { files: [file] } } as any);
      }
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    hapticFeedback?.impact('medium');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        hapticFeedback?.notification('success');
        onFileChange(file);
      } else {
        hapticFeedback?.notification('error');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
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
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer active:scale-95 ${
            isDragOver 
              ? 'border-primary/50 bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onClick={handleTelegramFileUpload}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Upload className={`h-12 w-12 mx-auto transition-colors ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <Smartphone className="h-4 w-4 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Upload CSV File
              </h3>
              <p className="text-sm text-muted-foreground">
                Send CSV file to @YourBotName or tap for instructions
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="lg"
                className="touch-manipulation min-h-[48px] w-full sm:w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTelegramFileUpload();
                }}
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Select CSV/Excel File
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Supports CSV, XLSX, and XLS files up to 10MB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📱 Send files directly to the bot in Telegram
                </p>
              </div>
            </div>
          </div>
          
          {/* Hidden fallback input for desktop drag-and-drop */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            tabIndex={-1}
          />
        </div>
      </CardContent>
    </Card>
  );
}
