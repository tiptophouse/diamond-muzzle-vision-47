
import { useRef } from "react";
import { Upload, File, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      
      // Accept CSV and text files (including tab-delimited)
      const validExtensions = ['.csv', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        onFileChange(null);
        return;
      }
      
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validExtensions = ['.csv', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validExtensions.includes(fileExtension)) {
        onFileChange(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (!selectedFile) {
    return (
      <div className="space-y-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-diamond-300 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            Drag and drop your CSV file here, or <span className="text-diamond-600 font-medium">browse</span> to select
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: CSV, TXT (comma, semicolon, or tab separated)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.txt,text/csv,text/plain,application/csv"
            onChange={handleFileChange}
          />
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">File Format Guidelines:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Headers: Stock#, Shape, Weight, Color, Clarity, Cut, Price/Crt</li>
                <li>• Optional: Lab, CertNumber, Polish, Symm, Fluo, Table, Depth</li>
                <li>• Use comma (,), semicolon (;), or tab separation</li>
                <li>• Each row represents one diamond</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
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
