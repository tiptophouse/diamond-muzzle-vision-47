
import { TelegramOptimizedLayout } from "@/components/TelegramOptimizedLayout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { UploadForm } from "@/components/upload/UploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";

export default function UploadSingleStonePage() {
  return (
    <TelegramOptimizedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Inventory</h1>
          <p className="text-muted-foreground">
            Upload your diamonds individually or in bulk using CSV
          </p>
        </div>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Single Diamond
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bulk CSV Upload
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
    </TelegramOptimizedLayout>
  );
}
