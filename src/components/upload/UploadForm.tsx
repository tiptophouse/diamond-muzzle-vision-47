
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useCsvProcessor } from "@/hooks/useCsvProcessor";
import { useUploadHandler } from "@/hooks/useUploadHandler";
import { FileUploadArea } from "./FileUploadArea";
import { UploadProgress } from "./UploadProgress";
import { UploadResult } from "./UploadResult";
import { UploadInstructions } from "./UploadInstructions";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { validateFile } = useCsvProcessor();
  const { uploading, progress, result, handleUpload, resetState } = useUploadHandler();

  const handleFileChange = (file: File | null) => {
    if (!validateFile(file)) {
      return;
    }
    
    setSelectedFile(file);
    resetState();
  };

  const resetForm = () => {
    setSelectedFile(null);
    resetState();
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="diamond-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Please log in to upload your inventory files.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="diamond-card mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FileUploadArea
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onReset={resetForm}
            />
            
            <UploadProgress progress={progress} uploading={uploading} />
            
            <UploadResult result={result} />
            
            {selectedFile && (
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={uploading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={handleUploadClick}
                  disabled={uploading || !!result}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Processing..." : "Process CSV"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <UploadInstructions userId={user?.id} />
    </div>
  );
}
