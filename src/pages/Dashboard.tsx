
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { DataDrivenDashboard } from "@/components/dashboard/DataDrivenDashboard";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { getVerificationResult } from "@/lib/api";
import { useUserDataPersistence } from "@/hooks/useUserDataPersistence";

export default function Dashboard() {
  console.log('🏠 Dashboard component rendering');
  
  const { user, isAuthenticated, isLoading, isTelegramEnvironment } = useTelegramAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Handle user data persistence in background
  useUserDataPersistence(user, isTelegramEnvironment);
  
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowDashboard(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Don't show anything while auth is loading
  if (isLoading || !showDashboard) {
    return <DashboardLoading />;
  }

  // Show dashboard for authenticated users
  if (isAuthenticated && user) {
    return (
      <Layout>
        <DataDrivenDashboard />
      </Layout>
    );
  }

  // Fallback - should not reach here due to AuthGuard
  return <DashboardLoading />;
}
