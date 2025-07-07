
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useIntelligentCsvProcessor } from "@/hooks/useIntelligentCsvProcessor";
import { useEnhancedUploadHandler } from "@/hooks/useEnhancedUploadHandler";
import { FileUploadArea } from "./FileUploadArea";
import { ProcessingSteps } from "./ProcessingSteps";
import { EnhancedUploadResult } from "./EnhancedUploadResult";
import { UploadInstructions } from "./UploadInstructions";
import { useIsMobile } from "@/hooks/use-mobile";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { validateFile } = useIntelligentCsvProcessor();
  const { uploading, progress, result, handleUpload, resetState } = useEnhancedUploadHandler();
  const isMobile = useIsMobile();

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
      <div className="w-full max-w-md mx-auto px-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="space-y-3">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto">
                <Smartphone className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
              <p className="text-sm text-gray-600">
                Please log in to upload your inventory files on mobile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            {isMobile && <Smartphone className="h-5 w-5 text-diamond-600" />}
            Bulk Upload Inventory
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isMobile ? "Upload CSV or Excel files directly from your phone" : "Upload your inventory data using CSV or Excel files"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <FileUploadArea
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            onReset={resetForm}
          />

          <ProcessingSteps progress={progress} uploading={uploading} />
          
          <EnhancedUploadResult result={result} fileName={selectedFile?.name} />

          {selectedFile && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={uploading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleUploadClick}
                disabled={uploading || !!result}
                className="w-full sm:w-auto bg-diamond-600 hover:bg-diamond-700 order-1 sm:order-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? (isMobile ? "Processing..." : "📱 Processing...") : (isMobile ? "Upload File" : "🚀 Process File")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UploadInstructions userId={user?.id} />
    </div>
  );
}
