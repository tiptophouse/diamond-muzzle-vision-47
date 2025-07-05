
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Clock, Sparkles } from "lucide-react";

export default function UploadSingleStonePage() {
  return (
    <Layout>
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
            <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Bulk CSV upload is being enhanced with advanced features
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">AI-Powered Field Mapping</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Real-time Data Validation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Batch Processing</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Smart Error Detection</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Use the Single Diamond upload for now, or contact support for early access to bulk features
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
