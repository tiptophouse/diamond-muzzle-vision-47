import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Diamond, CreditCard, Activity, Shield, Eye, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  blockedUsers: number;
  totalDiamonds: number;
  visibleDiamonds: number;
  todayShares: number;
  weeklyShares: number;
  monthlyShares: number;
  todayLogins: number;
  weeklyLogins: number;
  monthlyLogins: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    blockedUsers: 0,
    totalDiamonds: 0,
    visibleDiamonds: 0,
    todayShares: 0,
    weeklyShares: 0,
    monthlyShares: 0,
    todayLogins: 0,
    weeklyLogins: 0,
    monthlyLogins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all stats in parallel
      const [
        usersResult,
        activeUsersResult,
        premiumUsersResult,
        blockedUsersResult,
        diamondsResult,
        visibleDiamondsResult,
        todaySharesResult,
        weeklySharesResult,
        monthlySharesResult,
        todayLoginsResult,
        weeklyLoginsResult,
        monthlyLoginsResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('blocked_users').select('id', { count: 'exact', head: true }),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('store_visible', true).is('deleted_at', null),
        supabase.from('diamond_shares').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('diamond_shares').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('diamond_shares').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_sessions').select('telegram_id', { count: 'exact', head: true }).gte('session_start', new Date().toISOString().split('T')[0]),
        supabase.from('user_sessions').select('telegram_id', { count: 'exact', head: true }).gte('session_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_sessions').select('telegram_id', { count: 'exact', head: true }).gte('session_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        premiumUsers: premiumUsersResult.count || 0,
        blockedUsers: blockedUsersResult.count || 0,
        totalDiamonds: diamondsResult.count || 0,
        visibleDiamonds: visibleDiamondsResult.count || 0,
        todayShares: todaySharesResult.count || 0,
        weeklyShares: weeklySharesResult.count || 0,
        monthlyShares: monthlySharesResult.count || 0,
        todayLogins: todayLoginsResult.count || 0,
        weeklyLogins: weeklyLoginsResult.count || 0,
        monthlyLogins: monthlyLoginsResult.count || 0,
      });

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      // Error fetching admin stats - silently continue
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, subtitle }: {
    title: string;
    value: number;
    icon: React.ElementType;
    subtitle?: string;
  }) => (
    <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/70 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {isLoading ? '...' : value.toLocaleString()}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Statistics</h1>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Last updated: {lastUpdate}</span>
          </div>
        </div>
        <p className="text-muted-foreground">Real-time business metrics and system health</p>
      </div>

      {/* User Statistics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Active Users" value={stats.activeUsers} icon={Activity} subtitle="Last 7 days" />
          <StatCard title="Premium Users" value={stats.premiumUsers} icon={CreditCard} />
          <StatCard title="Blocked Users" value={stats.blockedUsers} icon={Shield} />
        </div>
      </div>

      {/* Diamond Statistics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Diamond className="h-5 w-5" />
          Diamond Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Diamonds" value={stats.totalDiamonds} icon={Diamond} />
          <StatCard title="Store Visible" value={stats.visibleDiamonds} icon={Eye} />
          <StatCard title="Hidden Diamonds" value={stats.totalDiamonds - stats.visibleDiamonds} icon={Shield} />
        </div>
      </div>

      {/* Sharing Activity */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sharing Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Today's Shares" value={stats.todayShares} icon={Calendar} />
          <StatCard title="Weekly Shares" value={stats.weeklyShares} icon={TrendingUp} />
          <StatCard title="Monthly Shares" value={stats.monthlyShares} icon={Activity} />
        </div>
      </div>

      {/* Login Activity */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Login Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Today's Logins" value={stats.todayLogins} icon={Calendar} />
          <StatCard title="Weekly Logins" value={stats.weeklyLogins} icon={TrendingUp} />
          <StatCard title="Monthly Logins" value={stats.monthlyLogins} icon={Activity} />
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Activity className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>
    </div>
  );
}