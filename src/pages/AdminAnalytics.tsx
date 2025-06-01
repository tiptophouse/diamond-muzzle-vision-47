
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserTracking } from '@/hooks/useUserTracking';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Users, Eye, Clock, Bell, Phone, MessageSquare, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminAnalytics() {
  const { user } = useTelegramAuth();
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { sessions, pageVisits, isLoading: trackingLoading } = useUserTracking();

  // Admin check - only allow specific admin user ID
  if (!user || user.id !== 2138564172) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">This page is only available to administrators.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalUsers = analytics.length;
  const activeUsers = analytics.filter(a => a.last_active && new Date(a.last_active) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
  const totalSessions = sessions.length;
  const totalPageViews = pageVisits.length;

  const topPages = pageVisits.reduce((acc, visit) => {
    acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPagesArray = Object.entries(topPages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  if (analyticsLoading || trackingLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Analytics</h1>
          <div className="grid gap-4 md:grid-cols-4">
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Analytics Dashboard</h1>
          <Badge variant="destructive" className="text-xs">ADMIN ONLY</Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Users active today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">User sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPageViews}</div>
              <p className="text-xs text-muted-foreground">Total page views</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="pages">Page Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Complete user information and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{user.telegram_id}</Badge>
                          <span className="font-medium">User ID: {user.telegram_id}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Visits: {user.total_visits} | 
                          API Calls: {user.api_calls_count} | 
                          Storage: {user.storage_used_mb}MB
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue: ${user.revenue_per_user} | 
                          Cost: ${user.cost_per_user} | 
                          Profit: ${user.profit_loss}
                        </div>
                        {user.last_active && (
                          <div className="text-xs text-muted-foreground">
                            Last active: {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                      <Badge variant={user.subscription_status === 'premium' ? 'default' : 'secondary'}>
                        {user.subscription_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Sessions</CardTitle>
                <CardDescription>Active and completed user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.slice(0, 20).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.telegram_id}</Badge>
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(session.session_start), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pages visited: {session.pages_visited} | 
                          Duration: {session.total_duration || 'Active'}
                        </div>
                        {session.user_agent && (
                          <div className="text-xs text-muted-foreground truncate max-w-md">
                            {session.user_agent}
                          </div>
                        )}
                      </div>
                      <Badge variant={session.is_active ? 'default' : 'secondary'}>
                        {session.is_active ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPagesArray.map(([path, count]) => (
                      <div key={path} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{path}</span>
                        <Badge variant="secondary">{count} visits</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Page Visits</CardTitle>
                  <CardDescription>Latest page activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pageVisits.slice(0, 10).map((visit) => (
                      <div key={visit.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{visit.page_path}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(visit.visit_timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        {visit.page_title && (
                          <div className="text-xs text-muted-foreground">{visit.page_title}</div>
                        )}
                        {visit.time_spent && (
                          <div className="text-xs text-muted-foreground">
                            Time spent: {visit.time_spent}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Centralized Notifications</CardTitle>
                <CardDescription>All bot notifications and user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Notification Center</h3>
                  <p className="text-muted-foreground mb-4">
                    This will centralize all notifications from the MazalChat bot across all users.
                  </p>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Configure Bot Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
