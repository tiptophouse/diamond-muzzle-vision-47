
import { Layout } from "@/components/layout/Layout";
import { FastAPITester } from "@/components/admin/FastAPITester";
import { AdminGuard } from "@/components/admin/AdminGuard";

export default function AdminFastAPITest() {
  return (
    <AdminGuard>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              FastAPI Connection Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Test and verify FastAPI backend connectivity and endpoint functionality
            </p>
          </div>
          
          <FastAPITester />
        </div>
      </Layout>
    </AdminGuard>
  );
}
