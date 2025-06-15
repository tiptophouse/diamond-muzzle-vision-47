
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, Camera, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useCsvProcessor } from "@/hooks/useCsvProcessor";
import { useUploadHandler } from "@/hooks/useUploadHandler";
import { FileUploadArea } from "./FileUploadArea";
import { UploadProgress } from "./UploadProgress";
import { UploadResult } from "./UploadResult";
import { UploadInstructions } from "./UploadInstructions";
import { UploadGiaQRDialog } from "./UploadGiaQRDialog";
import { DiamondFormData } from "@/components/inventory/form/types";
import { SingleStoneForm } from "./SingleStoneForm";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [singleStoneData, setSingleStoneData] = useState<Partial<DiamondFormData> | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { validateFile } = useCsvProcessor();
  const { uploading, progress, result, handleUpload, resetState } = useUploadHandler();

  // Inventory data hooks for sync functionality
  const {
    loading: inventoryLoading,
    handleRefresh,
  } = useInventoryData();

  // Inventory create logic for add diamond dialog
  const { addDiamond, isLoading: crudLoading } = useInventoryCrud({
    onSuccess: handleRefresh,
  });

  // Add Diamond Dialog state logic
  const handleFormSubmit = async (data: DiamondFormData) => {
    const success = await addDiamond(data);
    if (success) {
      setShowFormDialog(false);
    }
  };

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

  const handleQRSuccess = (giaData: any) => {
    setSingleStoneData({
      stockNumber: giaData.stockNumber || giaData.certificateNumber || "",
      shape: giaData.shape || "Round",
      carat: giaData.carat || 1,
      color: giaData.color || "G",
      clarity: giaData.clarity || "VS1",
      cut: giaData.cut || "Excellent",
      status: "Available",
      // Add other fields as needed
    });
    setShowQRDialog(false);
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
            {/* Moved "Add Diamond" and "Sync Data" buttons to the Upload page */}
            <div className="flex flex-col sm:flex-row gap-2 w-full mb-3">
              <Button
                onClick={() => setShowFormDialog(true)}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Diamond
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={inventoryLoading}
                className="w-full sm:flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${inventoryLoading ? 'animate-spin' : ''}`} />
                Sync Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQRDialog(true)}
                className="flex items-center gap-2 flex-1 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Camera className="h-5 w-5" />
                Scan GIA QR
              </Button>
            </div>
            <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Diamond</DialogTitle>
                </DialogHeader>
                <SingleStoneForm
                  initialData={{}}
                  onSubmit={handleFormSubmit}
                  isLoading={crudLoading}
                />
              </DialogContent>
            </Dialog>
            <UploadGiaQRDialog
              open={showQRDialog}
              onOpenChange={setShowQRDialog}
              onScanSuccess={handleQRSuccess}
            />
            {singleStoneData && (
              <div className="pt-4">
                <h3 className="font-semibold text-lg mb-2">Scan Result: Add Diamond</h3>
                <SingleStoneForm
                  initialData={singleStoneData}
                  onSubmit={() => setSingleStoneData(null)}
                  isLoading={false}
                />
              </div>
            )}

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
