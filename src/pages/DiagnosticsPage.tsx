
import { Layout } from "@/components/layout/Layout";
import { FastApiDiagnostics } from "@/components/diagnostics/FastApiDiagnostics";

export default function DiagnosticsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Diagnostics
          </h1>
          <p className="text-gray-600">
            Test and diagnose FastAPI connection issues
          </p>
        </div>
        
        <FastApiDiagnostics />
      </div>
    </Layout>
  );
}
