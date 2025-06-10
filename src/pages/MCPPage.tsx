
import { Layout } from "@/components/layout/Layout";
import { MCPDashboard } from "@/components/mcp/MCPDashboard";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function MCPPage() {
  return (
    <Layout>
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MCPDashboard />
          </div>
        </div>
      </AdminGuard>
    </Layout>
  );
}
