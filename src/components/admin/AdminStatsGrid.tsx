
import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AdminStatsGridProps {
  stats: {
    totalUsers: number;
    activeToday: number;
    premiumUsers: number;
    usersWithPhone: number;
  };
  blockedUsersCount: number;
  averageEngagement: number;
}

export function AdminStatsGrid({ stats, blockedUsersCount, averageEngagement }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <div className="cosmic-stats">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-purple-300">Total Registered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold cosmic-text">{stats.totalUsers}</div>
        </CardContent>
      </div>

      <div className="cosmic-stats">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-green-300">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.activeToday}</div>
        </CardContent>
      </div>

      <div className="cosmic-stats">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-yellow-300">Premium Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.premiumUsers}</div>
        </CardContent>
      </div>

      <div className="cosmic-stats">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-blue-300">Phone Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{stats.usersWithPhone}</div>
        </CardContent>
      </div>

      <div className="cosmic-stats">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-purple-300">Blocked Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-purple-400">{blockedUsersCount}</div>
        </CardContent>
      </div>

      <div className="cosmic-stats">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-orange-300">Avg Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-orange-400">{averageEngagement}%</div>
        </CardContent>
      </div>
    </div>
  );
}
