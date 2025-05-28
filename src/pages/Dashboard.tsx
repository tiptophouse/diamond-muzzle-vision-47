
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Diamond, Coins, Users, BadgeCheck } from "lucide-react";
import { api, apiEndpoints, setCurrentUserId } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { processDiamondDataForDashboard } from "@/services/diamondAnalytics";

interface DashboardStats {
  totalDiamonds: number;
  matchedPairs: number;
  totalLeads: number;
  activeSubscriptions: number;
}

interface InventoryData {
  name: string;
  value: number;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDiamonds: 0,
    matchedPairs: 0,
    totalLeads: 0,
    activeSubscriptions: 0,
  });
  
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [salesData, setSalesData] = useState<InventoryData[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setCurrentUserId(user.id);
      
      try {
        console.log(`Fetching diamond data for dashboard`);
        
        // Fetch all diamonds from your backend
        const diamondsResponse = await api.get<any[]>(
          apiEndpoints.getAllStones()
        );
        
        if (diamondsResponse.data) {
          console.log('Received diamond data:', diamondsResponse.data);
          
          // Process the diamond data for dashboard analytics
          const { stats: processedStats, inventoryByShape, salesByCategory } = 
            processDiamondDataForDashboard(diamondsResponse.data);
          
          setStats(processedStats);
          setInventoryData(inventoryByShape);
          setSalesData(salesByCategory);
        } else {
          console.warn('No diamond data received');
        }
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, isAuthenticated, authLoading]);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diamond-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please open this app through Telegram to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This app requires Telegram authentication to function properly.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Diamond Muzzle, {user?.first_name}. Here's an overview of your inventory.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Diamonds"
            value={stats.totalDiamonds}
            icon={Diamond}
            trend={7.4}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Matched Pairs"
            value={stats.matchedPairs}
            icon={BadgeCheck}
            trend={3.2}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Active Leads"
            value={stats.totalLeads}
            icon={Users}
            trend={-2.1}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            suffix=""
            icon={Coins}
            trend={12.5}
            trendLabel="vs last month"
            loading={loading}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InventoryChart
            title="Inventory by Shape"
            data={inventoryData}
            loading={loading}
          />
          
          <InventoryChart
            title="Diamond Distribution by Color"
            data={salesData}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
}
