
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Phone, Crown, Clock, TrendingUp, Download, Shield, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';

interface EnhancedUserData {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  language_code?: string;
  is_premium: boolean;
  photo_url?: string;
  created_at: string;
  total_visits: number;
  total_time_spent?: string;
  last_active?: string;
  lifetime_value: number;
  api_calls_count: number;
  subscription_status: string;
}

interface EnhancedUserTableProps {
  users: EnhancedUserData[];
  getUserEngagementScore: (user: EnhancedUserData) => number;
}

export function EnhancedUserTable({ users, getUserEngagementScore }: EnhancedUserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'visits' | 'engagement' | 'created'>('engagement');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [filterBlocked, setFilterBlocked] = useState<'all' | 'blocked' | 'active'>('all');
  
  const { isUserBlocked, blockUser, unblockUser, blockedUsers } = useBlockedUsers();

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const fullName = `${user.first_name} ${user.last_name || ''}`.toLowerCase();
      const searchMatch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        user.telegram_id.toString().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm);

      const premiumMatch = 
        filterPremium === 'all' ||
        (filterPremium === 'premium' && user.is_premium) ||
        (filterPremium === 'free' && !user.is_premium);

      const blocked = isUserBlocked(user.telegram_id);
      const blockedMatch = 
        filterBlocked === 'all' ||
        (filterBlocked === 'blocked' && blocked) ||
        (filterBlocked === 'active' && !blocked);

      return searchMatch && premiumMatch && blockedMatch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.first_name.localeCompare(b.first_name);
        case 'visits':
          return b.total_visits - a.total_visits;
        case 'engagement':
          return getUserEngagementScore(b) - getUserEngagementScore(a);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [users, searchTerm, sortBy, filterPremium, filterBlocked, getUserEngagementScore, isUserBlocked]);

  const exportData = () => {
    const csv = [
      ['Name', 'Telegram ID', 'Username', 'Phone', 'Premium', 'Visits', 'Engagement', 'Last Active', 'Created', 'Blocked'].join(','),
      ...filteredAndSortedUsers.map(user => [
        `"${user.first_name} ${user.last_name || ''}"`,
        user.telegram_id,
        user.username || '',
        user.phone_number || '',
        user.is_premium ? 'Yes' : 'No',
        user.total_visits,
        getUserEngagementScore(user),
        user.last_active || '',
        user.created_at,
        isUserBlocked(user.telegram_id) ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const handleToggleBlock = async (telegramId: number) => {
    const blocked = isUserBlocked(telegramId);
    if (blocked) {
      const blockedUser = blockedUsers.find(bu => bu.telegram_id === telegramId);
      if (blockedUser) {
        await unblockUser(blockedUser.id);
      }
    } else {
      await blockUser(telegramId, 'Blocked from admin panel');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Enhanced User Analytics
            </CardTitle>
            <CardDescription>
              Complete user profiles with engagement metrics and activity tracking
            </CardDescription>
          </div>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, Telegram ID, username, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="engagement">Sort by Engagement</option>
            <option value="visits">Sort by Visits</option>
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
          </select>
          <select 
            value={filterPremium} 
            onChange={(e) => setFilterPremium(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Users</option>
            <option value="premium">Premium Only</option>
            <option value="free">Free Only</option>
          </select>
          <select 
            value={filterBlocked} 
            onChange={(e) => setFilterBlocked(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedUsers.length} of {users.length} users
        </div>

        {/* User Table */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAndSortedUsers.map((user) => {
            const engagementScore = getUserEngagementScore(user);
            const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
            const blocked = isUserBlocked(user.telegram_id);
            
            return (
              <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 ${blocked ? 'bg-red-50 border-red-200' : ''}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photo_url} />
                    <AvatarFallback>
                      {user.first_name.charAt(0)}{user.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{fullName}</span>
                      {user.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
                      {user.phone_number && <Phone className="h-4 w-4 text-green-500" />}
                      {blocked && <Shield className="h-4 w-4 text-red-500" />}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant={blocked ? "destructive" : "outline"}>{user.telegram_id}</Badge>
                      {user.username && <span>@{user.username}</span>}
                      {user.phone_number && <span>{user.phone_number}</span>}
                      {user.language_code && <span>{user.language_code.toUpperCase()}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">{user.total_visits}</div>
                    <div className="text-xs text-muted-foreground">Visits</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">{user.api_calls_count}</div>
                    <div className="text-xs text-muted-foreground">API Calls</div>
                  </div>

                  <div className="text-center">
                    <div className={`w-12 h-2 rounded-full ${getEngagementColor(engagementScore)}`} />
                    <div className="text-xs text-muted-foreground mt-1">{engagementScore}%</div>
                  </div>

                  <div className="text-right">
                    {user.last_active ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Never active</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <Button
                    variant={blocked ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => handleToggleBlock(user.telegram_id)}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    {blocked ? 'Unblock' : 'Block'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
