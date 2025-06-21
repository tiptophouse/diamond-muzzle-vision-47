
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Activity, Clock, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { realTimeAnalyticsService, AdminAnalytics, UserAnalytics } from '@/services/realTimeAnalyticsService';
import { formatDistanceToNow } from 'date-fns';

export function AdminRealTimeAnalytics() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await realTimeAnalyticsService.getAdminAnalytics();
      setAnalytics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayName = (user: UserAnalytics) => {
    if (user.first_name && !['Test', 'Telegram', 'Emergency'].includes(user.first_name)) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `User ${user.telegram_id}`;
  };

  const getTopUsers = () => {
    if (!analytics?.users) return [];
    return analytics.users
      .sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0))
      .slice(0, 10);
  };

  const getActiveUsers = () => {
    if (!analytics?.users) return [];
    return analytics.users.filter(user => user.currently_active);
  };

  const getRecentUsers = () => {
    if (!analytics?.users) return [];
    return analytics.users
      .filter(user => user.last_active)
      .sort((a, b) => new Date(b.last_active!).getTime() - new Date(a.last_active!).getTime())
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Analytics Dashboard</h2>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse text-green-500" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics?.stats.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.stats.total_visits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Platform visits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Currently Active Users
            </CardTitle>
            <CardDescription>Users online right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getActiveUsers().length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No users currently active</p>
              ) : (
                getActiveUsers().map((user) => (
                  <div key={user.telegram_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{getDisplayName(user)}</div>
                      <div className="text-xs text-gray-500">ID: {user.telegram_id}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-600">
                        Online
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.current_session_pages || 0} pages
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users by Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Users by Visits</CardTitle>
            <CardDescription>Most active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getTopUsers().map((user, index) => (
                <div key={user.telegram_id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{getDisplayName(user)}</div>
                      <div className="text-xs text-gray-500">ID: {user.telegram_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{user.total_visits || 0} visits</Badge>
                    {user.last_active && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Recent User Activity
          </CardTitle>
          <CardDescription>Latest user sessions and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getRecentUsers().map((user) => (
              <div key={user.telegram_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${user.currently_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <div className="font-medium text-sm">{getDisplayName(user)}</div>
                    <div className="text-xs text-gray-500">
                      {user.total_visits || 0} visits • {formatPrice(user.revenue_per_user || 0)} revenue
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {user.subscription_status === 'premium' ? (
                      <Badge variant="default" className="bg-yellow-600">Premium</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                  {user.last_active && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
