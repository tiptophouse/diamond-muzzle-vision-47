
import { useRef, useState } from "react";
import { Upload, File, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadAreaProps {
  onFileSelect: (file: File) => Promise<void>;
  accept?: string;
  dragOver?: boolean;
  setDragOver?: (value: boolean) => void;
}

export function FileUploadArea({ onFileSelect, accept = ".csv,.xlsx,.xls", dragOver = false, setDragOver }: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Accept CSV and text files (including tab-delimited)
      const validExtensions = ['.csv', '.txt', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        return;
      }
      
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver?.(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validExtensions = ['.csv', '.txt', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validExtensions.includes(fileExtension)) {
        onFileSelect(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver?.(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver?.(false);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          dragOver 
            ? 'border-blue-400 bg-blue-50/50 scale-[1.02]' 
            : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-xl"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Drop your file here</h3>
        <p className="text-slate-600 mb-2">
          Drag and drop your CSV file here, or <span className="text-blue-600 font-medium">click to browse</span>
        </p>
        <p className="text-sm text-slate-500">
          Supported formats: CSV, Excel (.xlsx, .xls), TXT
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
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
