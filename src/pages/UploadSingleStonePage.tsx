
import { Layout } from "@/components/layout/Layout";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Scan } from "lucide-react";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function UploadSingleStonePage() {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScanSuccess = (giaData: any) => {
    console.log('GIA certificate scanned:', giaData);
    setIsScanning(false);
    
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: "Diamond certificate data has been extracted and saved",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Inventory</h1>
          <p className="text-muted-foreground">
            Scan diamond certificates or upload bulk CSV files
          </p>
        </div>
        
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan Certificate
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bulk CSV Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Diamond Certificate</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="p-8">
                  <Scan className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Scan QR Code or Certificate</h3>
                  <p className="text-muted-foreground mb-6">
                    Use your camera to scan diamond certificates and automatically extract all diamond information
                  </p>
                  <Button 
                    onClick={() => setIsScanning(true)}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-6">
            <UploadForm />
          </TabsContent>
        </Tabs>

        <QRCodeScanner
          isOpen={isScanning}
          onClose={() => setIsScanning(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    </Layout>
  );
}
