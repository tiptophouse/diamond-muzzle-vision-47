
import { Layout } from "@/components/layout/Layout";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PremiumCollection } from "@/components/dashboard/PremiumCollection";
import { MarketInsights } from "@/components/dashboard/MarketInsights";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bug } from "lucide-react";

const ADMIN_USER_ID = 2138564172;

export default function Dashboard() {
  const { user, isAuthenticated, isTelegramEnvironment } = useTelegramAuth();
  const [enableDataFetching, setEnableDataFetching] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Only use hooks if data fetching is enabled
  const inventoryHook = useInventoryData();
  const leadsHook = useLeads();
  const subscriptionsHook = useSubscriptions();
  const notificationsHook = useNotifications();

  // Fallback data for emergency mode
  const fallbackData = {
    allDiamonds: [],
    leads: [],
    subscriptions: [],
    notifications: [],
    loading: false,
    isLoading: false,
  };

  // Use actual data or fallback based on mode
  const {
    allDiamonds = [],
    loading: inventoryLoading = false,
    handleRefresh
  } = emergencyMode ? fallbackData : inventoryHook;
  
  const {
    leads = [],
    isLoading: leadsLoading = false
  } = emergencyMode ? fallbackData : leadsHook;
  
  const {
    subscriptions = [],
    isLoading: subscriptionsLoading = false
  } = emergencyMode ? fallbackData : subscriptionsHook;
  
  const {
    notifications = []
  } = emergencyMode ? fallbackData : notificationsHook;

  // Auto-enable emergency mode if any hook fails
  useEffect(() => {
    const hasErrors = !enableDataFetching || 
      (inventoryLoading && leadsLoading && subscriptionsLoading);
    
    if (hasErrors) {
      setEmergencyMode(true);
    }
  }, [inventoryLoading, leadsLoading, subscriptionsLoading, enableDataFetching]);

  // Calculate metrics with safe fallbacks
  const totalInventory = allDiamonds?.length || 0;
  const activeLeads = leads?.filter(lead => lead.status === 'active').length || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  // Safe calculations
  const totalValue = allDiamonds?.reduce((sum, diamond) => sum + (diamond.price || 0), 0) || 0;
  const avgCaratWeight = allDiamonds?.length > 0 ? 
    allDiamonds.reduce((sum, d) => sum + (d.carat || 0), 0) / allDiamonds.length : 0;
  const avgPricePerCarat = allDiamonds?.length > 0 ? 
    allDiamonds.reduce((sum, d) => sum + (d.price || 0) / (d.carat || 1), 0) / allDiamonds.length : 0;

  // Safe shape distribution
  const shapeData = allDiamonds?.reduce((acc, diamond) => {
    const shape = diamond.shape || 'Unknown';
    acc[shape] = (acc[shape] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const chartData = Object.entries(shapeData).map(([name, value]) => ({
    name,
    value: Number(value),
    color: '#7a63f5'
  }));

  // Premium diamonds calculation
  const premiumDiamonds = allDiamonds?.filter(d => (d.carat || 0) > 2 || (d.price || 0) > 10000) || [];

  // Show loading state if needed
  if (!emergencyMode && (inventoryLoading || leadsLoading || subscriptionsLoading)) {
    return <DashboardLoading onEmergencyMode={() => setEmergencyMode(true)} />;
  }

  const isAdminUser = user?.id === ADMIN_USER_ID;

  return (
    <Layout>
      <div className="space-y-4 p-2 sm:p-4">
        <DashboardHeader emergencyMode={emergencyMode} />
        
        {/* Enhanced User Debug Info */}
        {user && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <Badge variant="outline" className={isAdminUser ? "bg-red-50 border-red-200" : "bg-blue-50"}>
                👤 User ID: {user.id} {isAdminUser && "👑 ADMIN"}
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                📱 {user.first_name} {user.last_name}
              </Badge>
              <Badge variant="outline" className={isTelegramEnvironment ? "bg-purple-50" : "bg-yellow-50"}>
                🌐 {isTelegramEnvironment ? "Telegram" : "Dev Mode"}
              </Badge>
              <Badge variant="outline" className={totalInventory > 0 ? "bg-green-50" : "bg-red-50"}>
                💎 {totalInventory} diamonds
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={inventoryLoading}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${inventoryLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="h-6 px-2 text-xs"
              >
                <Bug className="h-3 w-3 mr-1" />
                {showDebugInfo ? 'Hide' : 'Show'} Debug
              </Button>
            </div>
            
            {/* Debug Information Panel */}
            {showDebugInfo && (
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong>Auth Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                    </div>
                    <div>
                      <strong>Loading:</strong> {inventoryLoading ? '⏳ Loading...' : '✅ Complete'}
                    </div>
                    <div>
                      <strong>Emergency Mode:</strong> {emergencyMode ? '🚨 Active' : '✅ Normal'}
                    </div>
                    <div>
                      <strong>Environment:</strong> {isTelegramEnvironment ? '📱 Telegram' : '💻 Development'}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <strong>API Endpoint:</strong> https://api.mazalbot.com/api/v1/get_all_stones?user_id={user.id}
                  </div>
                  {isAdminUser && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <strong>👑 Admin User Detected:</strong> You should see ALL diamonds in the system without filtering.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <MetricsGrid
          totalInventory={totalInventory}
          totalValue={totalValue}
          activeLeads={activeLeads}
          avgPricePerCarat={avgPricePerCarat}
          avgCaratWeight={avgCaratWeight}
          premiumDiamondsCount={premiumDiamonds.length}
          unreadNotifications={unreadNotifications}
        />

        {/* Charts and Detailed Info */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Shape Distribution</CardTitle>
              <CardDescription className="text-sm">
                Your inventory breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryChart data={chartData} title="" loading={inventoryLoading} />
            </CardContent>
          </Card>

          <PremiumCollection premiumDiamonds={premiumDiamonds} />
        </div>

        <MarketInsights />
      </div>
    </Layout>
  );
}
