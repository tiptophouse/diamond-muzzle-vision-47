
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { TrendingUp, Users, Crown, Bell } from "lucide-react";

export default function Dashboard() {
  const { allDiamonds, loading: inventoryLoading } = useInventoryData();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const { notifications } = useNotifications();

  // Calculate real metrics
  const totalInventory = allDiamonds.length;
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Calculate total inventory value
  const totalValue = allDiamonds.reduce((sum, diamond) => sum + (diamond.price || 0), 0);

  // Generate chart data for shapes
  const shapeData = allDiamonds.reduce((acc, diamond) => {
    const shape = diamond.shape || 'Unknown';
    acc[shape] = (acc[shape] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(shapeData).map(([name, value]) => ({
    name,
    value,
    color: '#7a63f5'
  }));

  // Recent activity data
  const recentActivity = [
    ...leads.slice(0, 3).map(lead => ({
      type: 'lead',
      title: `New lead from ${lead.customer_name}`,
      time: lead.created_at,
      description: `Inquiry type: ${lead.inquiry_type}`
    })),
    ...notifications.slice(0, 2).map(notif => ({
      type: 'notification',
      title: notif.title,
      time: notif.created_at,
      description: notif.message
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  if (inventoryLoading || leadsLoading || subscriptionsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-diamond-600 to-diamond-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your diamond business.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Inventory"
            value={totalInventory}
            description="Diamonds in stock"
            icon={TrendingUp}
            trend={12}
            trendLabel="from last month"
          />
          <StatCard
            title="Active Leads"
            value={activeLeads}
            description="Customer inquiries"
            icon={Users}
            trend={8}
            trendLabel="from last week"
          />
          <StatCard
            title="Active Subscriptions"
            value={activeSubscriptions}
            description="Current plans"
            icon={Crown}
            trend={0}
            trendLabel="unchanged"
          />
          <StatCard
            title="Notifications"
            value={unreadNotifications}
            description="Unread alerts"
            icon={Bell}
            trend={-3}
            trendLabel="from yesterday"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>
                Your diamond collection at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryChart 
                data={chartData}
                title="Diamonds by Shape"
                loading={inventoryLoading}
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity to display
                  </p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-diamond-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border border-diamond-200 dark:border-gray-600">
                      <div className={`p-1 rounded-full ${
                        activity.type === 'lead' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'lead' ? <Users className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-diamond-600">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Total collection value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lead Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {leads.length > 0 ? Math.round((activeLeads / leads.length) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                Active lead rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${totalInventory > 0 ? Math.round(totalValue / totalInventory).toLocaleString() : 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Per diamond
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
