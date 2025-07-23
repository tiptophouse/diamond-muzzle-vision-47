import { useRef } from "react";
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
  const { hapticFeedback } = useTelegramWebApp();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 File input triggered:', e.target.files?.length || 0, 'files');
    
    const file = e.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Validate file type - support multiple formats
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        console.log('❌ Invalid file type:', fileName);
        hapticFeedback?.notification('error');
        onFileChange(null);
        return;
      }
      
      console.log('✅ Valid file type, processing...');
      hapticFeedback?.impact('medium');
      onFileChange(file);
    } else {
      console.log('❌ No file selected');
    }
  };

  const handleButtonClick = () => {
    console.log('🖱️ File upload button clicked');
    hapticFeedback?.impact('light');
    
    // Try to trigger file input - add timeout for mobile compatibility
    setTimeout(() => {
      console.log('🔍 Triggering file input click');
      fileInputRef.current?.click();
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        hapticFeedback?.impact('medium');
        onFileChange(file);
      }
    }
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
                onClick={() => {
                  hapticFeedback?.impact('light');
                  onReset();
                }}
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
          {/* Mobile-optimized file upload */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload CSV File
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select your diamond inventory file from your device
            </p>
          </div>

          {/* Large, mobile-friendly upload button */}
          <Button 
            onClick={handleButtonClick}
            className="w-full h-14 text-lg font-medium"
            size="lg"
          >
            <FileSpreadsheet className="h-6 w-6 mr-3" />
            Choose File from Device
          </Button>

          {/* Drag and drop area for desktop (hidden on mobile) */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors hover:border-primary/50 cursor-pointer hidden md:block"
            onClick={handleButtonClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Or drag and drop your file here
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Supports CSV, XLSX, and XLS files up to 10MB
          </p>

          {/* Hidden file input with mobile-specific attributes */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileSelect}
            capture={false} // Prevent camera capture on mobile
            multiple={false}
            style={{ display: 'none' }} // Additional hiding for iOS
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
}