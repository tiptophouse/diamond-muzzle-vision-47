
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
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 md:p-12 text-center hover:border-diamond-300 transition-colors cursor-pointer touch-manipulation"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-400" />
        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">
          <span className="hidden md:inline">Drag and drop your inventory file here, or </span>
          <span className="text-diamond-600 font-medium text-base md:text-sm">Tap to select file</span>
        </p>
        <p className="mt-2 text-xs md:text-sm text-gray-500">
          📱 Mobile-friendly: CSV & XLSX supported
        </p>
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
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <File className="h-8 w-8 text-diamond-600 mr-3" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {selectedFile.name}
        </p>
        <p className="text-xs text-gray-500">
          {(selectedFile.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onReset}
        className="text-gray-600"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
