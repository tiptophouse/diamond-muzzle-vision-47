
import { Layout } from "@/components/layout/Layout";
import { UploadForm } from "@/components/upload/UploadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, FileText } from "lucide-react";


export default function UploadPage() {

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
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-primary/8 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4 text-primary">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-md">
                <Upload className="h-6 w-6" />
              </div>
              Upload Single Diamond
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add individual diamonds with detailed information and certificate scanning
            </p>
          </CardHeader>
          <CardContent>
            <Link to="/upload-single-stone">
              <Button
                data-tutorial="upload-single-diamond"
                variant="diamond"
                size="lg"
                className="w-full"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Single Diamond
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bulk Upload Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-primary/8 hover:border-primary/40 transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4 text-primary">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              Bulk CSV Upload
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload multiple diamonds at once using a CSV file with smart field mapping
            </p>
          </CardHeader>
          <CardContent>
            <Link to="/csv-bulk-upload">
              <Button
                variant="diamond"
                size="lg"
                className="w-full"
              >
                <FileText className="h-5 w-5 mr-2" />
                Upload CSV File
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
