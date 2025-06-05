
import { Layout } from "@/components/layout/Layout";
import { SingleStoneUploadForm } from "@/components/upload/SingleStoneUploadForm";

export default function UploadSingleStonePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Single Stone</h1>
          <p className="text-muted-foreground">
            Scan a GIA certificate or manually enter diamond details
          </p>
        </div>
        
        <SingleStoneUploadForm />
      </div>
    </Layout>
  );
}
