
import { useState } from "react";
import { FileUploadArea } from "./FileUploadArea";
import { UploadProgress } from "./UploadProgress";
import { UploadResult } from "./UploadResult";
import { UploadInstructions } from "./UploadInstructions";
import { useOptimizedDirectUpload } from "@/hooks/useOptimizedDirectUpload";
import { PremiumUploadLoading } from "@/components/premium/PremiumLoadingStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Upload, Zap } from "lucide-react";

export function OptimizedUploadForm() {
  const { uploading, progress, result, handleUpload, resetState } = useOptimizedDirectUpload();
  const [dragOver, setDragOver] = useState(false);

  const onFileSelect = async (file: File) => {
    console.log('📁 File selected for optimized upload:', file.name);
    resetState();
    await handleUpload(file);
  };

  if (uploading) {
    return <PremiumUploadLoading progress={progress} />;
  }

  return (
    <div className="space-y-8">
      {/* Premium upload header */}
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
          Upload Your Collection
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Effortlessly add your diamond inventory with our optimized, lightning-fast upload system
        </p>
      </div>

      {/* Upload cards */}
      <div className="grid gap-8 max-w-4xl mx-auto">
        {/* Main upload card */}
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:border-blue-300 transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Lightning Fast Upload
              </CardTitle>
            </div>
            <p className="text-slate-600">
              Drag & drop your CSV file or click to browse. Optimized for speed and reliability.
            </p>
          </CardHeader>
          <CardContent>
            <FileUploadArea
              onFileSelect={onFileSelect}
              accept=".csv,.xlsx,.xls"
              dragOver={dragOver}
              setDragOver={setDragOver}
            />
          </CardContent>
        </Card>

        {/* Progress indicator */}
        {progress > 0 && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <UploadProgress progress={progress} uploading={uploading} />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <UploadResult result={result} />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg text-slate-900">Upload Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <UploadInstructions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
