
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { FileText, Camera, Scan } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function UploadSingleStonePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScannedCertificate, setHasScannedCertificate] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const { toast } = useToast();

  const handleScanSuccess = (giaData: any) => {
    setScannedData(giaData);
    setHasScannedCertificate(true);
    setIsScanning(false);
    toast({
      title: "✅ Certificate Scanned",
      description: "Now you can add your diamond details",
    });
  };

  const handleStartOver = () => {
    setHasScannedCertificate(false);
    setScannedData(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* TMA-style header with safe area */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-4 py-3 safe-area-top">
            <h1 className="text-lg font-semibold text-foreground">Upload Inventory</h1>
            <p className="text-sm text-muted-foreground">
              {hasScannedCertificate ? "Complete your diamond details" : "Scan certificate or upload in bulk"}
            </p>
          </div>
        </div>

        <div className="px-4 pb-safe">
          {!hasScannedCertificate ? (
            <div className="space-y-4 pt-4">
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
            <div className="pt-4">
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-lg">
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
