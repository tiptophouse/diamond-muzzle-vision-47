
import { Layout } from "@/components/layout/Layout";
import { UploadForm } from "@/components/upload/UploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, FileText } from "lucide-react";
import { useTutorialInteraction } from "@/hooks/useTutorialInteraction";

export default function UploadPage() {
  useTutorialInteraction('[data-tutorial="upload-single-diamond"]');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Inventory</h1>
          <p className="text-muted-foreground">
            Upload your inventory data using CSV files or add individual diamonds
          </p>
        </div>
        
        {/* Single Diamond Upload Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-primary">
              <div className="p-2 rounded-full bg-primary/10">
                <Upload className="h-5 w-5" />
              </div>
              Upload Single Diamond
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Add individual diamonds with detailed information and certificate scanning
            </p>
          </CardHeader>
          <CardContent>
            <Link to="/upload-single-stone">
              <Button
                data-tutorial="upload-single-diamond"
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Single Diamond
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bulk Upload Card */}
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
    </Layout>
  );
}
