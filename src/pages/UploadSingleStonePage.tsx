
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";

export default function UploadSingleStonePage() {
  return (
    <Layout>
      {/* Mobile-first header with larger text and touch targets */}
      <div className="px-4 py-6 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Upload Inventory</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            Add diamonds to your inventory
          </p>
        </div>
        
        {/* Mobile-optimized tabs with larger touch targets */}
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl bg-muted p-1">
            <TabsTrigger 
              value="single" 
              className="flex items-center gap-3 h-12 text-base font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Single Diamond
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="flex items-center gap-3 h-12 text-base font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-5 w-5" />
              Bulk Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-6">
            <SingleStoneUploadForm />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-6">
            <UploadForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
