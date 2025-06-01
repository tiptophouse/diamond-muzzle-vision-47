
import React from 'react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { EnhancedUserTable } from '@/components/admin/EnhancedUserTable';
import { BlockedUsersManager } from '@/components/admin/BlockedUsersManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Crown, Phone, TrendingUp, DollarSign, Activity, Shield } from 'lucide-react';

export default function AdminAnalytics() {
  const { enhancedUsers, isLoading, getUserEngagementScore, getTopUsers, getUserStats } = useEnhancedAnalytics();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const stats = getUserStats();
  const topUsers = getTopUsers();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Real-time user analytics and engagement metrics
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.activeToday / stats.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% premium rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Verified</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usersWithPhone}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.usersWithPhone / stats.totalUsers) * 100) : 0}% verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Engaged Users
          </CardTitle>
          <CardDescription>Users with highest engagement scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-muted-foreground">@{user.username || user.telegram_id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{getUserEngagementScore(user)}% engagement</div>
                  <div className="text-sm text-muted-foreground">{user.total_visits} visits</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users Management */}
      <BlockedUsersManager />

      {/* Enhanced User Table */}
      <EnhancedUserTable 
        users={enhancedUsers} 
        getUserEngagementScore={getUserEngagementScore}
      />
    </div>
  );
}
