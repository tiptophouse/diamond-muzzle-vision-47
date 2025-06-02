
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useReportsData } from "@/hooks/useReportsData";
import { ReportsLoading } from "@/components/reports/ReportsLoading";
import { ReportsAuthError } from "@/components/reports/ReportsAuthError";
import { ReportsDataError } from "@/components/reports/ReportsDataError";
import { ReportsContent } from "@/components/reports/ReportsContent";

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading, user, error: authError } = useTelegramAuth();
  const {
    loading,
    allDiamonds,
    dataError,
    retryCount,
    fetchData,
    handleRetry,
  } = useReportsData();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user?.id]);

  // Auth loading state
  if (authLoading) {
    return (
      <Layout>
        <ReportsLoading />
      </Layout>
    );
  }

  // Auth error state
  if (!isAuthenticated || authError) {
    return (
      <Layout>
        <ReportsAuthError error={authError} />
      </Layout>
    );
  }

  // Data error state
  if (dataError && !loading) {
    return (
      <Layout>
        <ReportsDataError 
          error={dataError} 
          retryCount={retryCount} 
          onRetry={handleRetry} 
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <ReportsContent 
        allDiamonds={allDiamonds}
        loading={loading}
        onRefresh={fetchData}
      />
    </Layout>
  );
}
