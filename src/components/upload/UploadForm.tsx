
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
              <h3 className="text-xl font-semibold mb-2">🚀 AI-Powered Bulk Upload Coming Soon!</h3>
              <p className="text-muted-foreground mb-4">
                Get ready for our game-changing bulk upload feature! Upload any format - CSV, Excel, images, or text - and our AI will work its magic to intelligently process your inventory with detailed insights.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <strong className="text-blue-800">What's Coming:</strong>
                </div>
                <ul className="text-blue-700 text-left space-y-1">
                  <li>• Any file format support</li>
                  <li>• AI-powered data extraction</li>
                  <li>• Smart insights & analytics</li>
                  <li>• Instant inventory processing</li>
                </ul>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <strong>Meanwhile:</strong> Use our single stone upload feature for individual diamonds.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
