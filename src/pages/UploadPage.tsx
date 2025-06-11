
import { Layout } from "@/components/layout/Layout";
import { OptimizedUploadForm } from "@/components/upload/OptimizedUploadForm";

export default function UploadPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <OptimizedUploadForm />
        </div>
      </div>
    </Layout>
  );
}
