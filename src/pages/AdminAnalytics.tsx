
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserTracking } from '@/hooks/useUserTracking';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { EnhancedUserTable } from '@/components/admin/EnhancedUserTable';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { Users, Eye, Clock, Bell, Phone, MessageSquare, TrendingUp, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminAnalytics() {
  const { user } = useTelegramAuth();
  const { enhancedUsers, notifications, isLoading, getUserEngagementScore, getTopUsers, getUserStats, refetch } = useEnhancedAnalytics();
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

  if (isLoading || trackingLoading) {
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

  const userStats = getUserStats();
  const topUsers = getTopUsers();
  const totalSessions = sessions.length;
  const totalPageViews = pageVisits.length;

  const topPages = pageVisits.reduce((acc, visit) => {
    acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPagesArray = Object.entries(topPages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Analytics Dashboard</h1>
          <Badge variant="destructive" className="text-xs">ADMIN ONLY</Badge>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.activeToday}</div>
              <p className="text-xs text-muted-foreground">Users active in 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.totalUsers > 0 ? Math.round((userStats.premiumUsers / userStats.totalUsers) * 100) : 0}% premium
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phone Numbers</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.usersWithPhone}</div>
              <p className="text-xs text-muted-foreground">Users with phone</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Visits</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(userStats.averageVisits)}</div>
              <p className="text-xs text-muted-foreground">Per user</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Enhanced Users</TabsTrigger>
            <TabsTrigger value="top-users">Top Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="pages">Page Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <EnhancedUserTable users={enhancedUsers} getUserEngagementScore={getUserEngagementScore} />
          </TabsContent>

          <TabsContent value="top-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Engaged Users</CardTitle>
                <CardDescription>Users with highest engagement scores based on activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.map((user, index) => {
                    const engagementScore = getUserEngagementScore(user);
                    const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{fullName}</span>
                              {user.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline">{user.telegram_id}</Badge>
                              {user.username && <span>@{user.username}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{engagementScore}%</div>
                          <div className="text-sm text-muted-foreground">{user.total_visits} visits</div>
                        </div>
                      </div>
                    );
                  })}
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
            <NotificationCenter notifications={notifications} onRefresh={refetch} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
