import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Crown, Shield, Gem, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { QuickMessageSender } from './QuickMessageSender';

interface AdminOverviewProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    totalCosts: number;
    profit: number;
  };
  blockedUsersCount: number;
  averageEngagement: number;
  totalDiamonds: number;
  realTimeStats: {
    todayLogins: number;
    weeklyLogins: number;
    monthlyLogins: number;
  };
}

export function AdminOverview({ 
  stats, 
  blockedUsersCount, 
  averageEngagement, 
  totalDiamonds,
  realTimeStats 
}: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Registered users</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Active Users</CardTitle>
            <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Active this week</p>
          </CardContent>
        </Card>

        {/* Total Diamonds */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Diamonds</CardTitle>
            <Gem className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalDiamonds.toLocaleString()}</div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">In inventory</p>
          </CardContent>
        </Card>

        {/* Premium Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
          </CardContent>
        </Card>

        {/* Blocked Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Shield className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedUsersCount}</div>
          </CardContent>
        </Card>

        {/* Engagement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEngagement}%</div>
            <p className="text-xs text-muted-foreground mt-1">Weekly active rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Login Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Today's Logins</div>
              <div className="text-3xl font-bold text-primary">{realTimeStats.todayLogins}</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Weekly Logins</div>
              <div className="text-3xl font-bold text-accent">{realTimeStats.weeklyLogins}</div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Monthly Logins</div>
              <div className="text-3xl font-bold text-secondary">{realTimeStats.monthlyLogins}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Message Sender */}
      <QuickMessageSender />
    </div>
  );
}
