
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { AdminStatsGrid } from '@/components/admin/AdminStatsGrid';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { GroupCTAAnalytics } from '@/components/admin/GroupCTAAnalytics';
import UserInsightsAnalytics from '@/components/admin/UserInsightsAnalytics';
import { UserDiamondCounts } from '@/components/admin/UserDiamondCounts';
import { UserUploadAnalysis } from '@/components/admin/UserUploadAnalysis';
import { GroupCTASender } from '@/components/admin/GroupCTASender';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';
import { BarChart3, Users, Bell, TrendingUp, Activity, Database, Diamond, Upload, MessageSquare, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { getUserStats, isLoading: analyticsLoading } = useEnhancedAnalytics();
  const { stats: diamondStats, loading: diamondLoading } = useUserDiamondCounts();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Get comprehensive stats from both hooks
  const userStats = getUserStats();
  const combinedStats = {
    totalUsers: diamondStats.totalUsers || userStats.totalUsers,
    activeUsers: userStats.activeUsers,
    premiumUsers: userStats.premiumUsers,
    totalRevenue: userStats.totalRevenue,
    totalCosts: userStats.totalCosts,
    profit: userStats.profit,
  };

  const isLoading = analyticsLoading || diamondLoading;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and user management
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading diamond counts from FastAPI...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Overview - Similar to your original dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{combinedStats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{combinedStats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Diamond className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{diamondStats.totalDiamonds}</div>
            <div className="text-sm text-muted-foreground">Total Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{diamondStats.usersWithDiamonds}</div>
            <div className="text-sm text-muted-foreground">With Uploads</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{diamondStats.usersWithZeroDiamonds}</div>
            <div className="text-sm text-muted-foreground">No Uploads</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{diamondStats.avgDiamondsPerUser}</div>
            <div className="text-sm text-muted-foreground">Avg per User</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="diamonds" className="flex items-center space-x-2">
            <Diamond className="w-4 h-4" />
            <span>Diamonds</span>
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Uploads</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>User Insights</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="group-cta" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Group CTA</span>
          </TabsTrigger>
          <TabsTrigger value="cta-analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>CTA Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStatsGrid 
            stats={combinedStats} 
            blockedUsersCount={0} 
            averageEngagement={0} 
          />
          
          {/* Real-time Bot Usage Card - like in your original */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-Time Bot Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Today's Logins</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diamonds" className="space-y-6">
          <UserDiamondCounts />
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <UserUploadAnalysis />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <UserInsightsAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminUserManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter 
            notifications={[]} 
            onRefresh={handleRefresh} 
          />
        </TabsContent>

        <TabsContent value="group-cta" className="space-y-6">
          <GroupCTASender />
        </TabsContent>

        <TabsContent value="cta-analytics" className="space-y-6">
          <GroupCTAAnalytics />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and reporting tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
