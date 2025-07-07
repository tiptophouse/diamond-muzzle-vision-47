
import { useRef } from "react";
import { Upload, File, XCircle, Smartphone } from "lucide-react";
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
        onFileChange(null);
        return;
      }
      
      onFileChange(file);
    }
  };

  if (!selectedFile) {
    return (
      <div className="w-full">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 md:p-12 text-center hover:border-diamond-300 transition-colors cursor-pointer touch-manipulation active:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-diamond-50 rounded-full">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-diamond-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Upload Your Inventory File
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Tap to select your CSV or Excel file from your device
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
              <Smartphone className="h-4 w-4" />
              <span>Mobile friendly • CSV & XLSX supported</span>
            </div>

            <Button 
              type="button"
              className="mt-4 w-full sm:w-auto bg-diamond-600 hover:bg-diamond-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-xl p-4 sm:p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 bg-diamond-100 rounded-lg">
          <File className="h-6 w-6 sm:h-8 sm:w-8 text-diamond-600" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
            {selectedFile.name}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
          </p>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg"
        >
          <XCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}
