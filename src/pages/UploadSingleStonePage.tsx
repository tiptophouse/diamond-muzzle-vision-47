
import { Layout } from "@/components/layout/Layout";
import { TelegramCertificateScanner } from "@/components/upload/TelegramCertificateScanner";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, QrCode } from "lucide-react";

export default function UploadSingleStonePage() {
  return (
    <Layout>
      <div className="space-y-4 px-4 pb-safe">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Upload Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Scan certificates or upload CSV files
          </p>
        </div>
        
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scan" className="flex items-center gap-2 text-sm">
              <QrCode className="h-4 w-4" />
              Scan Certificate
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Bulk CSV Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="mt-0">
            <TelegramCertificateScanner />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-0">
            <UploadForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
