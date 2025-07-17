
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { FileText, Camera, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadSingleStonePage() {
  const [searchParams] = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);
  const [hasScannedCertificate, setHasScannedCertificate] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();

  // Check if we should start scanning immediately
  useEffect(() => {
    if (searchParams.get('action') === 'scan') {
      setIsScanning(true);
    }
  }, [searchParams]);

  const handleScanSuccess = (giaData: any) => {
    setScannedData(giaData);
    setHasScannedCertificate(true);
    setShowSuccessMessage(true);
    setIsScanning(false);
    
    // Auto-hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
    
    toast({
      title: "✅ Certificate Scanned",
      description: "Now you can add your diamond details",
      duration: 1500, // Auto-hide after 1.5 seconds
    });
  };

  const handleStartOver = () => {
    setHasScannedCertificate(false);
    setScannedData(null);
    setShowSuccessMessage(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="px-4 pb-safe pt-4">
          {!hasScannedCertificate ? (
            <div className="space-y-4">
              {/* Scan Certificate Card - Primary Action */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-primary">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Scan className="h-5 w-5" />
                    </div>
                    Scan GIA Certificate
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Fastest way to add a diamond - scan your certificate for instant data entry
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setIsScanning(true)}
                    className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Certificate Scan
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Upload Option */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    Bulk CSV Upload
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple diamonds at once using a CSV file
                  </p>
                </CardHeader>
                <CardContent>
                  <UploadForm />
                </CardContent>
              </Card>
            </div>
          ) : (
            // Show form after successful scan
            <div>
              {showSuccessMessage && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-lg animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Certificate scanned successfully</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartOver}
                      className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              )}
              <SingleStoneUploadForm 
                initialData={scannedData}
                showScanButton={false}
              />
            </div>
          )}
        </div>

        {/* QR Scanner Modal */}
        <QRCodeScanner
          isOpen={isScanning}
          onClose={() => setIsScanning(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    </Layout>
  );
}
