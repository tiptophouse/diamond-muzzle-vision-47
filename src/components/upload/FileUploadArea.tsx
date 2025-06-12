
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
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
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
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-diamond-300 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto text-gray-400" />
        <p className="mt-4 text-sm text-gray-600">
          Drag and drop your CSV file here, or <span className="text-diamond-600 font-medium">browse</span> to select
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Supported format: CSV
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
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
