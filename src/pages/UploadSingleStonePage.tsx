
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";

export default function UploadSingleStonePage() {
  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Inventory</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload your diamonds individually or in bulk using CSV
          </p>
        </div>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10">
            <TabsTrigger 
              value="single" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 btn-touch"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Single Diamond</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 btn-touch"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Bulk CSV Upload</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4 sm:mt-6">
            <div className="mobile-scroll">
              <SingleStoneUploadForm />
            </div>
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-4 sm:mt-6">
            <div className="mobile-scroll">
              <UploadForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
