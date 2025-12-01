
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useIntelligentCsvProcessor } from "@/hooks/useIntelligentCsvProcessor";
import { useEnhancedUploadHandler } from "@/hooks/useEnhancedUploadHandler";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Card className="border border-border bg-card">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Header Icon */}
            <div className="w-16 h-16 bg-[#0088cc]/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="h-8 w-8 text-[#0088cc]" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                AI-Powered Upload
              </h2>
              <p className="text-sm text-muted-foreground">
                Coming Soon
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4 text-left max-w-md mx-auto">
              <p className="text-sm text-foreground leading-relaxed">
                We're building an amazing bulk upload feature that will revolutionize how you manage your diamond inventory.
              </p>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI will intelligently process any file format and extract valuable insights from your data.
              </p>
            </div>

            {/* Features List */}
            <div className="bg-[#0088cc]/5 border border-[#0088cc]/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[#0088cc] mb-3">
                What's Coming:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-left">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full"></div>
                  <span className="text-foreground">Any file format support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full"></div>
                  <span className="text-foreground">AI-powered extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full"></div>
                  <span className="text-foreground">Smart insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full"></div>
                  <span className="text-foreground">Instant processing</span>
                </div>
              </div>
            </div>

            {/* Current Option */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Available Now:
              </h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Use our single stone upload to add individual diamonds to your inventory.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => navigate('/upload?action=scan')}
              >
                Add Single Diamond
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
