
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminUserManager from '@/components/admin/AdminUserManager';
import AdminStatsGrid from '@/components/admin/AdminStatsGrid';
import NotificationCenter from '@/components/admin/NotificationCenter';
import GroupCTAAnalytics from '@/components/admin/GroupCTAAnalytics';
import UserInsightsAnalytics from '@/components/admin/UserInsightsAnalytics';
import { BarChart3, Users, Bell, TrendingUp, Activity, Database } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and user management
        </p>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>User Insights</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="cta" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Group CTA</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <UserInsightsAnalytics />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AdminStatsGrid />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <AdminUserManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="cta" className="space-y-6">
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
