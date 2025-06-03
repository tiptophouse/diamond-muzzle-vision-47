
import React from 'react';
import { Users, UserCheck, Crown, Phone, Shield, TrendingUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminStatsGridProps {
  stats: {
    totalUsers: number;
    activeToday: number;
    premiumUsers: number;
    usersWithPhone: number;
  };
  blockedUsersCount: number;
  averageEngagement: number;
  onDeleteFakeUsers?: () => void;
}

export function AdminStatsGrid({ 
  stats, 
  blockedUsersCount, 
  averageEngagement,
  onDeleteFakeUsers 
}: AdminStatsGridProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Registered */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Users className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Total Registered</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <UserCheck className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Active Users</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeToday}</div>
        </div>

        {/* Premium Users */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Crown className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Premium Users</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.premiumUsers}</div>
        </div>

        {/* Phone Verified */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Phone className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Phone Verified</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.usersWithPhone}</div>
        </div>

        {/* Blocked Users */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <Shield className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Blocked Users</div>
          </div>
          <div className="text-2xl font-bold text-white">{blockedUsersCount}</div>
        </div>

        {/* Avg Engagement */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <TrendingUp className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-xs text-slate-400 font-medium">Avg Engagement</div>
          </div>
          <div className="text-2xl font-bold text-white">{averageEngagement}%</div>
        </div>
      </div>

      {/* Delete Fake Users Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Database Cleanup</h3>
            <p className="text-slate-400 text-sm">Remove test and fake user accounts from the system</p>
          </div>
          <Button
            onClick={onDeleteFakeUsers}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Fake Users
          </Button>
        </div>
      </div>
    </div>
  );
}
