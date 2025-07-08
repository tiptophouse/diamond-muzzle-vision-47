
import { useRef } from "react";
import { Upload, File, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadAreaProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onReset: () => void;
}

export function FileUploadArea({ selectedFile, onFileChange, onReset }: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type - support both CSV and XLSX for mobile users
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
        // Let parent handle validation error
        onFileChange(null);
        return;
      }
      
      onFileChange(file);
    }
  };

  if (!selectedFile) {
    return (
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 md:p-12 text-center hover:border-diamond-300 active:border-diamond-400 transition-colors cursor-pointer touch-manipulation min-h-[120px] flex flex-col justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 sm:h-14 sm:w-14 mx-auto text-gray-400 mb-3" />
        <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
          <span className="hidden sm:inline">Drop your file here or </span>
          <span className="text-diamond-600 font-semibold">Tap to Select</span>
        </p>
        <p className="text-sm text-gray-500">
          📱 CSV & XLSX files supported
        </p>
        <div className="mt-3 px-4 py-2 bg-diamond-50 rounded-full inline-block">
          <span className="text-xs text-diamond-700">Mobile optimized upload</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple={false}
          capture={false}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg border">
      <File className="h-8 w-8 text-diamond-600 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
          {selectedFile.name}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          {(selectedFile.size / 1024).toFixed(2)} KB • Ready to upload
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="lg" 
        onClick={onReset}
        className="text-gray-600 min-h-[44px] min-w-[44px] touch-manipulation ml-2"
        aria-label="Remove file"
      >
        <XCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}
