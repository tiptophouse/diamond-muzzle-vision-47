
import { Layout } from "@/components/layout/Layout";
import { DiamondViewer } from "@/components/dashboard/DiamondViewer";
import { EnhancedStatsGrid } from "@/components/dashboard/EnhancedStatsGrid";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useLeads } from "@/hooks/useLeads";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useNotifications } from "@/hooks/useNotifications";
import { TrendingUp, Users, Crown, Bell, Sparkles, BarChart3 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { allDiamonds, loading: inventoryLoading } = useInventoryData();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const { notifications } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  // Calculate real metrics
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
    color: theme === 'dark' ? '#a855f7' : '#7a63f5'
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
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button variant="outline" onClick={toggleTheme} className="glass-card">
              <Sparkles className="h-4 w-4 mr-2" />
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>
          <EnhancedStatsGrid diamonds={[]} loading={true} />
          <div className="grid gap-6 md:grid-cols-2">
            <DiamondViewer diamonds={[]} loading={true} />
            <Card className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-diamond-600 via-purple-600 to-diamond-700 bg-clip-text text-transparent">
              Diamond Muzzle
            </h1>
            <p className="text-muted-foreground mt-2">
              Premium diamond management at your fingertips
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleTheme} className="glass-card">
              <Sparkles className="h-4 w-4 mr-2" />
              {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>
        </div>

        <EnhancedStatsGrid diamonds={allDiamonds} loading={inventoryLoading} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DiamondViewer diamonds={allDiamonds} loading={inventoryLoading} />
          </div>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-diamond-600" />
                Quick Insights
              </CardTitle>
              <CardDescription>
                Key metrics at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-diamond-50 to-blue-50 dark:from-diamond-950 dark:to-blue-950 border">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Active Leads</span>
                </div>
                <span className="text-lg font-bold text-green-600">{activeLeads}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Subscriptions</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{activeSubscriptions}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{unreadNotifications}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-diamond-600 mb-1">
                    ${totalValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
              <CardDescription>
                Diamond shapes in your collection
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

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity to display
                  </p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-diamond-50 to-blue-50 dark:from-diamond-950 dark:to-blue-950 border border-diamond-200 dark:border-diamond-800">
                      <div className={`p-1 rounded-full ${
                        activity.type === 'lead' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
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
      </div>
    </Layout>
  );
}
