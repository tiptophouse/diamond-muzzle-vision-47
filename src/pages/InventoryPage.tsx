
import { Layout } from "@/components/layout/Layout";
import { InventoryPageContent } from "@/components/inventory/InventoryPageContent";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export default function InventoryPage() {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useTelegramAuth();

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Authenticating...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || authError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center px-4">
            <p className="text-red-600 mb-4">
              {authError || "Authentication required to view inventory"}
            </p>
            <p className="text-slate-600">Please ensure you're accessing this app through Telegram.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <InventoryPageContent />
    </Layout>
  );
}
