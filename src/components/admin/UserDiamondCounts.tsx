
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';
import { 
  Users, 
  Diamond, 
  Search, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Clock,
  Database
} from 'lucide-react';

export function UserDiamondCounts() {
  const {
    userCounts,
    stats,
    loading,
    lastUpdated,
    forceRefresh,
    cacheInfo
  } = useUserDiamondCounts();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_diamonds' | 'zero_diamonds'>('all');

  const filteredUsers = userCounts.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telegram_id.toString().includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'with_diamonds' && user.diamond_count > 0) ||
      (filterStatus === 'zero_diamonds' && user.diamond_count === 0);
    
    return matchesSearch && matchesFilter;
  });

  const getDiamondBadgeColor = (count: number) => {
    if (count === 0) return 'bg-red-100 text-red-800';
    if (count < 10) return 'bg-yellow-100 text-yellow-800';
    if (count < 50) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading diamond counts from FastAPI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cache Status & Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Cache Status */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4 text-center">
            <Database className={`h-8 w-8 mx-auto mb-2 ${cacheInfo.isValid ? 'text-green-600' : 'text-orange-600'}`} />
            <div className="text-sm font-medium">Cache Status</div>
            <div className={`text-xs ${cacheInfo.isValid ? 'text-green-600' : 'text-orange-600'}`}>
              {cacheInfo.isValid ? 'Fresh' : 'Expired'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatLastUpdated(lastUpdated)}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.usersWithDiamonds}</div>
            <div className="text-sm text-muted-foreground">With Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{stats.usersWithZeroDiamonds}</div>
            <div className="text-sm text-muted-foreground">Zero Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Diamond className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.totalDiamonds}</div>
            <div className="text-sm text-muted-foreground">Total Diamonds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{stats.avgDiamondsPerUser}</div>
            <div className="text-sm text-muted-foreground">Avg per User</div>
          </CardContent>
        </Card>
      </div>

      {/* User Diamond Counts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Diamond className="h-5 w-5" />
              User Diamond Counts (Cached FastAPI Data)
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or Telegram ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({stats.totalUsers})
              </Button>
              <Button
                variant={filterStatus === 'with_diamonds' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('with_diamonds')}
                size="sm"
              >
                With Diamonds ({stats.usersWithDiamonds})
              </Button>
              <Button
                variant={filterStatus === 'zero_diamonds' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('zero_diamonds')}
                size="sm"
              >
                Zero Diamonds ({stats.usersWithZeroDiamonds})
              </Button>
            </div>
            
            <Button onClick={forceRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh
            </Button>
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Telegram ID</th>
                  <th className="text-center p-2">Diamond Count</th>
                  <th className="text-left p-2">Last Upload</th>
                  <th className="text-left p-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.telegram_id.toString()} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name || ''}
                        </div>
                        {user.username && (
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-sm">{user.telegram_id.toString()}</td>
                    <td className="p-2 text-center">
                      <Badge className={getDiamondBadgeColor(user.diamond_count)}>
                        {user.diamond_count} diamonds
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {user.last_upload 
                        ? new Date(user.last_upload).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
