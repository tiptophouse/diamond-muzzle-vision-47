
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Crown, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { ContactsModal } from './ContactsModal';

interface AdminStatsGridProps {
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
  allUsers?: any[];
}

export function AdminStatsGrid({ stats, blockedUsersCount, averageEngagement, allUsers = [] }: AdminStatsGridProps) {
  const [showContactsModal, setShowContactsModal] = useState(false);
  const { impactOccurred } = useTelegramHapticFeedback();

  // Calculate real users count (excluding mock data)
  const realUsersCount = allUsers.filter(user => {
    const isReal = user.first_name && 
      !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name) &&
      user.telegram_id > 1000000;
    return isReal;
  }).length;

  const handleOpenContacts = () => {
    impactOccurred('medium');
    setShowContactsModal(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overscroll-contain">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-95 min-h-[120px] touch-target"
          onClick={handleOpenContacts}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realUsersCount}</div>
            <p className="text-xs text-muted-foreground">Tap to view contacts</p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active this week</p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedUsersCount}</div>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Profit: ${stats.profit.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEngagement}%</div>
          </CardContent>
        </Card>
      </div>

      <ContactsModal 
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        users={allUsers}
      />
    </>
  );
}
