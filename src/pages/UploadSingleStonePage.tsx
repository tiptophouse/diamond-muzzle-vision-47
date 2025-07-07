
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function UploadSingleStonePage() {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isMobile ? "Add Inventory" : "Upload Inventory"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {isMobile 
              ? "Add diamonds one by one or upload in bulk"
              : "Upload your diamonds individually or in bulk using CSV"
            }
          </p>
        </div>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-12' : ''}`}>
            <TabsTrigger 
              value="single" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}
            >
              <Plus className="h-4 w-4" />
              {isMobile ? "Single" : "Single Diamond"}
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}
            >
              {isMobile ? <Smartphone className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {isMobile ? "Bulk" : "Bulk CSV Upload"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4 sm:mt-6">
            <SingleStoneUploadForm />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-4 sm:mt-6">
            <UploadForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
