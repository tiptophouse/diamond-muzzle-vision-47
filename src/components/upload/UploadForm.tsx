
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useIntelligentCsvProcessor } from "@/hooks/useIntelligentCsvProcessor";
import { useEnhancedUploadHandler } from "@/hooks/useEnhancedUploadHandler";
import { FileUploadArea } from "./FileUploadArea";
import { UploadProgress } from "./UploadProgress";
import { ProcessingSteps } from "./ProcessingSteps";
import { EnhancedUploadResult } from "./EnhancedUploadResult";
import { UploadInstructions } from "./UploadInstructions";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { validateFile } = useIntelligentCsvProcessor();
  const { uploading, progress, result, handleUpload, resetState } = useEnhancedUploadHandler();

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
    <div className="max-w-xl mx-auto px-4 sm:px-0">
      <Card className="diamond-card mb-6">
        <CardContent className="pt-6">
          <div className="space-y-6 text-center">
            <div className="p-8">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bulk Upload Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're currently fixing some issues with bulk upload functionality. 
                This feature will be available again soon.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Note:</strong> For now, please use the single stone upload feature available on other pages.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
