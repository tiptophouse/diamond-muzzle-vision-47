
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Diamond, Coins, Users, BadgeCheck } from "lucide-react";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      try {
        console.log(`Fetching dashboard data for user ${user.id}`);
        
        // Fetch dashboard stats
        const statsResponse = await api.get<DashboardStats>(
          apiEndpoints.getDashboardStats(user.id)
        );
        
        if (statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          // Fallback to mock data if API fails
          setStats({
            totalDiamonds: 1287,
            matchedPairs: 42,
            totalLeads: 96,
            activeSubscriptions: 18,
          });
        }

        // Fetch inventory by shape
        const inventoryResponse = await api.get<InventoryData[]>(
          apiEndpoints.getInventoryByShape(user.id)
        );
        
        if (inventoryResponse.data) {
          setInventoryData(inventoryResponse.data);
        } else {
          // Fallback data
          setInventoryData([
            { name: "Round", value: 582 },
            { name: "Princess", value: 231 },
            { name: "Cushion", value: 142 },
            { name: "Oval", value: 118 },
            { name: "Pear", value: 64 },
            { name: "Other", value: 150 },
          ]);
        }

        // Fetch recent sales data
        const salesResponse = await api.get<InventoryData[]>(
          apiEndpoints.getRecentSales(user.id)
        );
        
        if (salesResponse.data) {
          setSalesData(salesResponse.data);
        } else {
          // Fallback data
          setSalesData([
            { name: "0-1 carat", value: 28 },
            { name: "1-2 carat", value: 42 },
            { name: "2-3 carat", value: 18 },
            { name: "3-4 carat", value: 8 },
            { name: "4+ carat", value: 4 },
          ]);
        }
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Use fallback data on error
        setStats({
          totalDiamonds: 1287,
          matchedPairs: 42,
          totalLeads: 96,
          activeSubscriptions: 18,
        });
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
            Welcome to Diamond Muzzle, {user.first_name}. Here's an overview of your inventory.
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
            title="Recent Sales by Category"
            data={salesData}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
}
