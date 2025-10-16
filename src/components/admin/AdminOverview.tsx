import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Crown, Shield, Gem, TrendingUp, DollarSign, Activity, Megaphone, BarChart3, Settings, MessageSquare } from 'lucide-react';
import { QuickMessageSender } from './QuickMessageSender';
import { ContactsModal } from './ContactsModal';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useNavigate } from 'react-router-dom';

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
  allUsers?: any[];
}

export function AdminOverview({ 
  stats, 
  blockedUsersCount, 
  averageEngagement, 
  totalDiamonds,
  realTimeStats,
  allUsers = []
}: AdminOverviewProps) {
  const [showContactsModal, setShowContactsModal] = useState(false);
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();

  const handleOpenContacts = () => {
    impactOccurred('medium');
    setShowContactsModal(true);
  };

  const handleNavigate = (tab: string) => {
    impactOccurred('light');
    navigate(`/admin?tab=${tab}`);
  };

  // Calculate real users count (excluding mock data)
  const realUsersCount = allUsers.filter(user => {
    const isReal = user.first_name && 
      !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name) &&
      user.telegram_id > 1000000;
    return isReal;
  }).length;

  const averageDiamondsPerUser = stats.totalUsers > 0 ? Math.round(totalDiamonds / stats.totalUsers) : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users - Now Clickable */}
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all active:scale-95 min-h-[120px]"
          onClick={handleOpenContacts}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{realUsersCount.toLocaleString()}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Click to view all contacts</p>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => handleNavigate('campaigns')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Megaphone className="h-5 w-5" />
              <span className="text-xs">Campaigns</span>
            </Button>
            <Button 
              onClick={() => handleNavigate('analytics')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button 
              onClick={() => handleNavigate('users')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Users</span>
            </Button>
            <Button 
              onClick={() => handleNavigate('notifications')}
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diamond Statistics Detailed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5" />
            Diamond Inventory Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-muted-foreground mb-2">Total Diamonds</div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{totalDiamonds.toLocaleString()}</div>
            </div>
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-muted-foreground mb-2">Average per User</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{averageDiamondsPerUser}</div>
            </div>
            <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-muted-foreground mb-2">Active Inventory</div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">{totalDiamonds.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        users={allUsers}
      />
    </div>
  );
}
